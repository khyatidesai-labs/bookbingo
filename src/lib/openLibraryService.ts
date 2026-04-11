import type { Book } from '../types';

/**
 * Open Library API Service
 * Fetches books dynamically from Open Library at runtime
 * with intelligent caching to avoid rate limits
 */

const CACHE = new Map<string, { data: Book[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

/**
 * Convert Open Library doc to Book type
 */
function mapOpenLibraryToBook(doc: any, index: number): Book {
  const isbn = doc.isbn?.[0] || '';
  const coverId = doc.cover_id;

  return {
    id: isbn || `ol-${doc.key}`,
    title: doc.title || 'Unknown',
    author: doc.author_name?.[0] || 'Unknown Author',
    isbn: isbn,
    cover: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
    description: doc.first_sentence?.[0] || doc.title,
    pages: doc.number_of_pages || 200,
    year: doc.first_publish_year || new Date().getFullYear(),
    genres: doc.subject?.slice(0, 3) || ['Fiction'],
    moods: [], // Will be populated by recommendation logic
    professions: [], // Will be populated by recommendation logic
    tags: doc.has_fulltext ? ['full-text'] : [],
  };
}

/**
 * Fetch books from Open Library API with caching
 */
async function fetchFromOpenLibrary(query: string): Promise<Book[]> {
  const cacheKey = query;
  const cached = CACHE.get(cacheKey);

  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `https://openlibrary.org/search.json?${query}&limit=50`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    const books: Book[] = (data.docs || [])
      .map((doc: any, idx: number) => mapOpenLibraryToBook(doc, idx))
      .filter((book: Book) => book.title && book.author); // Remove invalid entries

    // Cache the results
    CACHE.set(cacheKey, { data: books, timestamp: Date.now() });
    return books;
  } catch (error) {
    console.error('Failed to fetch from Open Library:', error);
    return [];
  }
}

/**
 * Fetch trending/popular books
 */
export async function fetchTrendingBooks(): Promise<Book[]> {
  return fetchFromOpenLibrary('subject=bestseller&sort=newest');
}

/**
 * Fetch books by mood/subject
 */
export async function fetchBooksByMood(mood: string): Promise<Book[]> {
  const moodSubjectMap: Record<string, string> = {
    'feel-good': 'happiness+inspirational',
    'dark-deep': 'dark+psychological+mystery',
    'motivational': 'self-help+motivation+personal-growth',
    'romantic': 'love+relationships+romance',
    'mind-bending': 'science-fiction+mystery+thriller+philosophy',
  };

  const subject = moodSubjectMap[mood] || mood;
  return fetchFromOpenLibrary(`subject=${subject}&sort=newest`);
}

/**
 * Fetch books by profession
 */
export async function fetchBooksByProfession(profession: string): Promise<Book[]> {
  const professionSubjectMap: Record<string, string> = {
    developer: 'programming+computer+science+software',
    designer: 'design+creativity+art+ux',
    entrepreneur: 'business+startup+entrepreneurship+management',
    lawyer: 'law+legal+justice',
    doctor: 'medicine+health+science+biology',
    educator: 'education+teaching+learning+psychology',
    scientist: 'science+research+physics+chemistry+biology',
  };

  const subject = professionSubjectMap[profession] || profession;
  return fetchFromOpenLibrary(`subject=${subject}&sort=newest`);
}

/**
 * Fetch new releases this week
 */
export async function fetchNewReleases(): Promise<Book[]> {
  return fetchFromOpenLibrary('sort=newest');
}

/**
 * Search for books by title or author
 */
export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];
  return fetchFromOpenLibrary(`q=${encodeURIComponent(query)}`);
}

/**
 * Fetch books by multiple subjects for discovery
 */
export async function fetchBooksBySubjects(subjects: string[]): Promise<Book[]> {
  const subjectQuery = subjects.map(s => `subject=${encodeURIComponent(s)}`).join('&');
  return fetchFromOpenLibrary(`${subjectQuery}&sort=newest`);
}

/**
 * Clear cache (useful for manual refresh)
 */
export function clearCache(): void {
  CACHE.clear();
}
