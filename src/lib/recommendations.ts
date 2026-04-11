import type { Book, Mood, Profession } from '../types';
import { BOOKS } from '../data/books';

export interface RecommendationFilter {
  profession?: Profession;
  moods: Mood[];
  query?: string;
}

export interface ScoredBook {
  book: Book;
  score: number;
  reasons: string[];
}

/**
 * Rule-based recommender. Scoring:
 *   +4 profession match
 *   +3 mood match (per mood)
 *   +1 text hit in title/author/description/genres
 *
 * Returns up to `limit` results, sorted by score desc. With no filters, the
 * full catalogue is returned in a stable order so "Trending" still has content.
 *
 * Hot-swap point: if a VITE_OPENAI_API_KEY is set later, you can call
 * recommendWithOpenAI() instead — same signature.
 */
export function recommend(
  filter: RecommendationFilter,
  limit = 12,
): ScoredBook[] {
  const { profession, moods, query } = filter;
  const q = query?.trim().toLowerCase();

  const scored: ScoredBook[] = BOOKS.map((book) => {
    let score = 0;
    const reasons: string[] = [];

    if (profession && book.professions.includes(profession)) {
      score += 4;
      reasons.push(`Picked for ${profession}s`);
    }
    for (const m of moods) {
      if (book.moods.includes(m)) {
        score += 3;
        reasons.push(`Matches mood: ${labelForMood(m)}`);
      }
    }
    if (q) {
      const haystack = `${book.title} ${book.author} ${book.description} ${book.genres.join(
        ' ',
      )}`.toLowerCase();
      if (haystack.includes(q)) {
        score += 1;
        reasons.push(`Matches "${query}"`);
      }
    }
    return { book, score, reasons };
  });

  // No filters? Return a stable "trending" slice (high tag count first).
  const anyFilter = Boolean(profession || moods.length || q);
  if (!anyFilter) {
    return [...BOOKS]
      .sort((a, b) => trendingScore(b) - trendingScore(a))
      .slice(0, limit)
      .map((book) => ({ book, score: 0, reasons: ['Trending now'] }));
  }

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function trendingScore(b: Book): number {
  const bonus = (b.tags.includes('bestseller') ? 2 : 0) + (b.tags.includes('award-winner') ? 1 : 0);
  return bonus + b.professions.length;
}

function labelForMood(m: Mood): string {
  return m.replace('-', ' ');
}

// --- LLM-powered recommender ------------------------------------------------
//
// Strategy: pre-filter the catalogue with the rule-based scorer (top 40
// candidates) and ask an LLM to rank *only those ids* with a short
// human-readable reason. This keeps the prompt small, grounds the model
// to our real catalogue, and still gives us nice generated copy.
//
// Works with any OpenAI-compatible Chat Completions endpoint:
//   - OpenAI        (default)       https://api.openai.com/v1
//   - OpenRouter                    https://openrouter.ai/api/v1
//   - Together, Groq, etc.          (set VITE_OPENAI_BASE_URL accordingly)
//
// Env vars:
//   VITE_OPENAI_API_KEY   required — the API key
//   VITE_OPENAI_BASE_URL  optional — e.g. https://openrouter.ai/api/v1
//   VITE_OPENAI_MODEL     optional — e.g. openai/gpt-4o-mini for OpenRouter
//
// Browser-exposed — fine for a hackathon, but move to a backend proxy
// before production. Falls back to the rule-based list on any
// missing-key / network / parse error.

interface OpenAIPick {
  id: string;
  reason: string;
}

const cache = new Map<string, ScoredBook[]>();

function cacheKey(filter: RecommendationFilter, limit: number): string {
  return JSON.stringify({
    p: filter.profession ?? '',
    m: [...filter.moods].sort(),
    q: filter.query ?? '',
    limit,
  });
}

export function isOpenAIEnabled(): boolean {
  return Boolean(import.meta.env.VITE_OPENAI_API_KEY);
}

export async function recommendWithOpenAI(
  filter: RecommendationFilter,
  limit = 12,
): Promise<ScoredBook[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return recommend(filter, limit);

  const key = cacheKey(filter, limit);
  const cached = cache.get(key);
  if (cached) return cached;

  // Build a candidate pool with the rule-based scorer so we never hand the
  // model more than ~40 books. Falls back to a general "trending" slice.
  const pool = recommend(filter, 40);
  if (pool.length === 0) return [];

  const catalog = pool.map(({ book }) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    year: book.year,
    genres: book.genres,
    moods: book.moods,
    professions: book.professions,
    desc: book.description.slice(0, 160),
  }));

  const context = [
    filter.profession ? `profession: ${filter.profession}` : null,
    filter.moods.length ? `moods: ${filter.moods.join(', ')}` : null,
    filter.query ? `query: ${filter.query}` : null,
  ]
    .filter(Boolean)
    .join('; ') || 'general trending';

  const rawBase =
    (import.meta.env.VITE_OPENAI_BASE_URL as string) || 'https://api.openai.com/v1';
  const isOpenRouter = rawBase.includes('openrouter.ai');
  // In dev, go through the Vite proxy at /api/llm to bypass CORS. In prod
  // builds (import.meta.env.DEV === false), call the upstream URL directly —
  // you'll need a real backend proxy there or your key will be CORS-blocked.
  const baseUrl = import.meta.env.DEV ? '/api/llm' : rawBase.replace(/\/$/, '');
  const model =
    (import.meta.env.VITE_OPENAI_MODEL as string) ||
    (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (isOpenRouter) {
    // OpenRouter asks clients to self-identify. Harmless elsewhere.
    headers['HTTP-Referer'] =
      typeof window !== 'undefined' ? window.location.origin : 'https://book-bingo.local';
    headers['X-Title'] = 'Book Bingo';
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly book recommender. You will receive a reader context and a JSON "catalog" of candidate books. Return strict JSON of the shape: {"picks":[{"id":"<catalog id>","reason":"<=10 words"}]}. Order best→worst, use only ids from the catalog, and keep reasons specific and warm (not generic). Do not invent books.',
          },
          {
            role: 'user',
            content: JSON.stringify({ context, limit, catalog }),
          },
        ],
      }),
    });

    if (!res.ok) {
      console.warn('[openai] request failed', res.status, await res.text());
      return pool.slice(0, limit);
    }

    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) return pool.slice(0, limit);

    const parsed = JSON.parse(content) as { picks?: OpenAIPick[] };
    const picks = parsed.picks ?? [];

    const byId = new Map(pool.map((s) => [s.book.id, s.book]));
    const ranked: ScoredBook[] = [];
    picks.forEach((p, i) => {
      const book = byId.get(p.id);
      if (book) {
        ranked.push({
          book,
          score: picks.length - i,
          reasons: [p.reason || 'Picked for you'],
        });
      }
    });

    const result = ranked.length > 0 ? ranked.slice(0, limit) : pool.slice(0, limit);
    cache.set(key, result);
    return result;
  } catch (err) {
    console.warn('[openai] error, falling back to rule-based', err);
    return pool.slice(0, limit);
  }
}
