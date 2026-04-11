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
  isbn?: string;
}

async function fetchCoverFromOpenLibrary(title: string, author: string, isbn?: string): Promise<string> {
  try {
    if (isbn) {
      const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }

    const query = encodeURIComponent(`${title} ${author}`);
    const searchUrl = `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_id,isbn`;
    const res = await fetch(searchUrl);
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

  const seed = encodeURIComponent(title);
  return `https://picsum.photos/seed/${seed}/300/450`;
}

async function getOpenAIReleases(apiKey: string): Promise<BookResult[]> {
  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `Today is ${currentDate}. Return a JSON array of exactly 10 notable books published or widely released in the past 2-3 months (recent 2024-2025 releases). These should be real books available in bookstores.

For each book return this exact JSON structure (no extra fields):
{
  "title": "string",
  "author": "string",
  "description": "string (2-3 sentences about the book)",
  "pages": number,
  "year": number (publication year),
  "genres": ["string", "string"],
  "isbn": "string or empty string"
}

Return ONLY a valid JSON array, no markdown, no explanation.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  let parsed: any[];
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    throw new Error("Failed to parse OpenAI response as JSON");
  }

  const books: BookResult[] = await Promise.all(
    parsed.slice(0, 10).map(async (item: any, idx: number) => {
      const cover = await fetchCoverFromOpenLibrary(item.title, item.author, item.isbn);
      return {
        id: `ai-new-${idx}-${Date.now()}`,
        title: item.title || "Unknown",
        author: item.author || "Unknown Author",
        cover,
        description: item.description || item.title,
        pages: item.pages || 300,
        year: item.year || new Date().getFullYear(),
        genres: item.genres?.slice(0, 3) || ["Fiction"],
        moods: [],
        professions: [],
        tags: ["new-release", "ai-curated"],
        isbn: item.isbn || undefined,
      };
    })
  );

  return books;
}

async function getFallbackReleases(): Promise<BookResult[]> {
  const queries = [
    "subject=fiction&sort=new&limit=20",
    "subject=nonfiction&sort=new&limit=20",
  ];

  const results: BookResult[] = [];

  for (const q of queries) {
    try {
      const res = await fetch(`https://openlibrary.org/search.json?${q}`);
      if (!res.ok) continue;
      const data = await res.json();
      const docs = (data.docs || []).filter((d: any) => d.title && d.author_name && d.cover_id);
      for (const doc of docs.slice(0, 5)) {
        results.push({
          id: doc.isbn?.[0] || `ol-${doc.key}`,
          title: doc.title,
          author: doc.author_name[0],
          cover: `https://covers.openlibrary.org/b/id/${doc.cover_id}-L.jpg`,
          description: doc.first_sentence?.[0] || doc.title,
          pages: doc.number_of_pages_median || 250,
          year: doc.first_publish_year || new Date().getFullYear(),
          genres: doc.subject?.slice(0, 3) || ["Fiction"],
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

  try {
    const openAIKey = Deno.env.get("OPENAI_API_KEY");

    let books: BookResult[];

    if (openAIKey) {
      try {
        books = await getOpenAIReleases(openAIKey);
      } catch (err) {
        console.error("OpenAI failed, using fallback:", err);
        books = await getFallbackReleases();
      }
    } else {
      books = await getFallbackReleases();
    }

    return new Response(JSON.stringify({ books, source: openAIKey ? "openai" : "openlibrary" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), books: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
