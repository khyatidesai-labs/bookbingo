import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookResult {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  pages: number;
  year: number;
  genres: string[];
  moods: string[];
  professions: string[];
  tags: string[];
}

async function fetchCoverFromOpenLibrary(title: string, author: string): Promise<string> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_id,isbn`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const doc = data.docs?.[0];
      if (doc?.cover_id) return `https://covers.openlibrary.org/b/id/${doc.cover_id}-L.jpg`;
      if (doc?.isbn?.[0]) return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
    }
  } catch (_) {}
  const seed = encodeURIComponent(title.replace(/\s+/g, "-").toLowerCase());
  return `https://picsum.photos/seed/${seed}/300/450`;
}

async function getAITrendingBooks(
  apiKey: string,
  profession?: string,
  moods?: string[]
): Promise<BookResult[]> {
  const currentDate = new Date().toISOString().split("T")[0];

  let context = "currently trending and popular";
  if (profession && moods?.length) {
    context = `recommended for a ${profession} who enjoys ${moods.join(", ")} reads`;
  } else if (profession) {
    context = `recommended for a ${profession}`;
  } else if (moods?.length) {
    context = `that match the mood: ${moods.join(", ")}`;
  }

  const prompt = `Today is ${currentDate}. List exactly 10 real books ${context}. These must be real, verifiable published books.

Return ONLY a JSON array (no markdown, no code blocks, no explanation) with this exact structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "description": "2-3 sentence description of what the book is about.",
    "pages": 320,
    "year": 2023,
    "genres": ["Fiction", "Thriller"]
  }
]`;

  const isOpenRouter = apiKey.startsWith("sk-or-");
  const apiUrl = isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      ...(isOpenRouter ? { "HTTP-Referer": "https://bookbingo.app", "X-Title": "Book Bingo" } : {}),
    },
    body: JSON.stringify({
      model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that returns only valid JSON arrays with no extra text, markdown, or code fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2500,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  let content: string = data.choices?.[0]?.message?.content ?? "";
  content = content.trim();
  if (content.startsWith("```")) {
    content = content.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
  }

  let parsed: any[];
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    throw new Error(`JSON parse failed. Raw: ${content.slice(0, 300)}`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI returned empty or non-array result");
  }

  const books: BookResult[] = await Promise.all(
    parsed.slice(0, 10).map(async (item: any, idx: number) => {
      const cover = await fetchCoverFromOpenLibrary(item.title ?? "", item.author ?? "");
      return {
        id: `ai-trend-${idx}-${Date.now()}`,
        title: item.title ?? "Unknown",
        author: item.author ?? "Unknown Author",
        cover,
        description: item.description ?? item.title ?? "",
        pages: typeof item.pages === "number" ? item.pages : 300,
        year: typeof item.year === "number" ? item.year : new Date().getFullYear(),
        genres: Array.isArray(item.genres) ? item.genres.slice(0, 3) : ["Fiction"],
        moods: moods ?? [],
        professions: profession ? [profession] : [],
        tags: ["trending", "ai-curated"],
      };
    })
  );

  return books;
}

async function getFallbackTrending(): Promise<BookResult[]> {
  const results: BookResult[] = [];
  const searches = [
    "subject=bestseller&sort=new",
    "subject=popular&sort=rating",
    "subject=award-winning&sort=new",
  ];

  for (const q of searches) {
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?${q}&limit=15&fields=title,author_name,cover_id,isbn,first_publish_year,subject,number_of_pages_median,first_sentence`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const docs = (data.docs ?? []).filter(
        (d: any) => d.title && d.author_name?.length && d.cover_id
      );
      for (const doc of docs.slice(0, 4)) {
        results.push({
          id: doc.isbn?.[0] ?? `ol-${Math.random()}`,
          title: doc.title,
          author: doc.author_name[0],
          cover: `https://covers.openlibrary.org/b/id/${doc.cover_id}-L.jpg`,
          description: doc.first_sentence?.[0] ?? doc.title,
          pages: doc.number_of_pages_median ?? 250,
          year: doc.first_publish_year ?? new Date().getFullYear(),
          genres: doc.subject?.slice(0, 3) ?? ["Fiction"],
          moods: [],
          professions: [],
          tags: ["trending"],
        });
      }
    } catch (_) {}
  }

  return results.slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let profession: string | undefined;
    let moods: string[] | undefined;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        profession = body.profession;
        moods = body.moods;
      } catch (_) {}
    } else {
      const url = new URL(req.url);
      profession = url.searchParams.get("profession") ?? undefined;
      const moodsParam = url.searchParams.get("moods");
      moods = moodsParam ? moodsParam.split(",") : undefined;
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    let books: BookResult[] = [];
    let source = "openlibrary";

    if (apiKey) {
      try {
        books = await getAITrendingBooks(apiKey, profession, moods);
        source = "openai";
      } catch (err) {
        console.error("AI failed, using fallback:", err);
        books = await getFallbackTrending();
      }
    } else {
      books = await getFallbackTrending();
    }

    return new Response(
      JSON.stringify({ books, source }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err), books: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
