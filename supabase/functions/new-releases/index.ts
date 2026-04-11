import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/** Stable, URL-safe slug so the same book always gets the same id. */
function stableId(prefix: string, title: string, author: string): string {
  const slug = `${title}-${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${prefix}-${slug}`;
}

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
  isbn?: string;
}

async function fetchCoverFromOpenLibrary(title: string, author: string): Promise<string> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const searchUrl = `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_id,isbn`;
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const doc = data.docs?.[0];
      if (doc?.cover_id) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_id}-L.jpg`;
      }
      if (doc?.isbn?.[0]) {
        return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
      }
    }
  } catch (_) {}
  const seed = encodeURIComponent(title.replace(/\s+/g, "-").toLowerCase());
  return `https://picsum.photos/seed/${seed}/300/450`;
}

async function getOpenAIReleases(apiKey: string): Promise<BookResult[]> {
  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `Today is ${currentDate}. List exactly 10 real books that were published in 2024 or 2025. These must be real, verifiable books available in stores.

Return ONLY a JSON array (no markdown, no code blocks, no explanation) with this exact structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "description": "2-3 sentence description of what the book is about.",
    "pages": 320,
    "year": 2024,
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
      temperature: 0.5,
      max_tokens: 2500,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI ${response.status}: ${errText}`);
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
  } catch (e) {
    throw new Error(`JSON parse failed. Raw content: ${content.slice(0, 300)}`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("OpenAI returned empty or non-array result");
  }

  const books: BookResult[] = await Promise.all(
    parsed.slice(0, 10).map(async (item: any, idx: number) => {
      const cover = await fetchCoverFromOpenLibrary(item.title ?? "", item.author ?? "");
      return {
        id: stableId("ai-new", item.title ?? "", item.author ?? ""),
        title: item.title ?? "Unknown",
        author: item.author ?? "Unknown Author",
        cover,
        description: item.description ?? item.title ?? "",
        pages: typeof item.pages === "number" ? item.pages : 300,
        year: typeof item.year === "number" ? item.year : new Date().getFullYear(),
        genres: Array.isArray(item.genres) ? item.genres.slice(0, 3) : ["Fiction"],
        moods: [],
        professions: [],
        tags: ["new-release", "ai-curated"],
      };
    })
  );

  return books;
}

async function getFallbackReleases(): Promise<BookResult[]> {
  const results: BookResult[] = [];

  const searches = [
    "subject=literary+fiction&sort=new",
    "subject=thriller&sort=new",
    "subject=biography&sort=new",
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
          id: doc.isbn?.[0] ?? `ol-${doc.key ?? Math.random()}`,
          title: doc.title,
          author: doc.author_name[0],
          cover: `https://covers.openlibrary.org/b/id/${doc.cover_id}-L.jpg`,
          description: doc.first_sentence?.[0] ?? doc.title,
          pages: doc.number_of_pages_median ?? 250,
          year: doc.first_publish_year ?? new Date().getFullYear(),
          genres: doc.subject?.slice(0, 3) ?? ["Fiction"],
          moods: [],
          professions: [],
          tags: ["new-release"],
          isbn: doc.isbn?.[0],
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

  const openAIKey = Deno.env.get("OPENAI_API_KEY");
  let source = "openlibrary";
  let errorDetail: string | null = null;

  let books: BookResult[] = [];

  if (openAIKey) {
    try {
      books = await getOpenAIReleases(openAIKey);
      source = "openai";
    } catch (err) {
      errorDetail = String(err);
      console.error("OpenAI failed:", errorDetail);
      try {
        books = await getFallbackReleases();
      } catch (fbErr) {
        console.error("Fallback also failed:", fbErr);
      }
    }
  } else {
    try {
      books = await getFallbackReleases();
    } catch (fbErr) {
      console.error("Fallback failed:", fbErr);
    }
  }

  return new Response(
    JSON.stringify({ books, source, ...(errorDetail ? { openai_error: errorDetail } : {}) }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
