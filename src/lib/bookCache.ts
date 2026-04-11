import type { Book } from '../types';
import { fetchBooksBySubjects } from './openLibraryService';

const CACHE_KEY_PREFIX = 'book_cache_';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CachedBooks {
  books: Book[];
  timestamp: number;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get cached books from localStorage
 */
function getCachedBooks(cacheKey: string): Book[] | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
    if (!stored) return null;

    const cached: CachedBooks = JSON.parse(stored);
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
      return null;
    }

    return cached.books;
  } catch (error) {
    console.error('Error reading book cache:', error);
    return null;
  }
}

/**
 * Store books in localStorage cache
 */
function setCachedBooks(cacheKey: string, books: Book[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const cached: CachedBooks = {
      books,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${cacheKey}`, JSON.stringify(cached));
  } catch (error) {
    console.error('Error writing book cache:', error);
  }
}

/**
 * Fetch books with fallback to Open Library if local database is empty
 * Caches results in localStorage
 */
export async function fetchBooksWithFallback(
  tags: string[],
  cacheKey: string
): Promise<Book[]> {
  // Try to get from localStorage cache first
  const cached = getCachedBooks(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    // Fallback to Open Library if no cache
    console.log(`Fetching books from Open Library for tags: ${tags.join(', ')}`);
    const books = await fetchBooksBySubjects(tags);

    if (books && books.length > 0) {
      setCachedBooks(cacheKey, books);
      return books;
    }

    return [];
  } catch (error) {
    console.error('Error fetching books with fallback:', error);
    return [];
  }
}

/**
 * Clear cache for a specific collection
 */
export function clearCollectionCache(cacheKey: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
  } catch (error) {
    console.error('Error clearing collection cache:', error);
  }
}

/**
 * Clear all book caches
 */
export function clearAllBookCaches(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all book caches:', error);
  }
}
