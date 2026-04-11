import type { Book, BingoCard, BingoChallenge, BingoSquare } from '../types';
import { BOOK_BY_ID } from '../data/books';
import { CHALLENGES, CHALLENGE_BY_ID } from '../data/bingoChallenges';

/** Length 15, row-major indices of a 3x5 grid (3 rows, 5 columns). */
export const GRID_SIZE_ROWS = 3;
export const GRID_SIZE_COLS = 5;
export const GRID_CELLS = GRID_SIZE_ROWS * GRID_SIZE_COLS;

/** Rows and columns as arrays of cell indices (3x5 grid - no diagonals with non-square grid). */
export const WINNING_LINES: number[][] = (() => {
  const lines: number[][] = [];
  // All rows (3)
  for (let r = 0; r < GRID_SIZE_ROWS; r++) {
    lines.push(Array.from({ length: GRID_SIZE_COLS }, (_, c) => r * GRID_SIZE_COLS + c));
  }
  // All columns (5)
  for (let c = 0; c < GRID_SIZE_COLS; c++) {
    lines.push(Array.from({ length: GRID_SIZE_ROWS }, (_, r) => r * GRID_SIZE_COLS + c));
  }
  return lines;
})();

/** Does a single book satisfy the challenge? */
export function bookMatchesChallenge(book: Book, challenge: BingoChallenge): boolean {
  if (challenge.matchTags?.some((t) => book.tags.includes(t))) return true;
  if (challenge.matchMoods?.some((m) => book.moods.includes(m))) return true;
  if (challenge.matchGenres?.some((g) => book.genres.includes(g))) return true;
  if (challenge.matchProfessions?.some((p) => book.professions.includes(p))) return true;
  if (challenge.minPages !== undefined && book.pages >= challenge.minPages) return true;
  if (challenge.maxPages !== undefined && book.pages <= challenge.maxPages) return true;
  if (challenge.beforeYear !== undefined && book.year < challenge.beforeYear) return true;
  if (challenge.afterYear !== undefined && book.year > challenge.afterYear) return true;
  return false;
}

/** Books that satisfy a given challenge (for the book-picker modal). */
export function booksForChallenge(challenge: BingoChallenge, pool: Book[]): Book[] {
  return pool.filter((b) => bookMatchesChallenge(b, challenge));
}

/**
 * Pick 25 distinct challenge ids. We try to pick challenges that have at
 * least one matching book in the seeded catalogue so the user can always
 * complete a square. Falls back to any challenge if the pool is too small.
 */
export function generateChallengeIds(pool: Book[], seed = Date.now()): string[] {
  const solvable = CHALLENGES.filter((c) => booksForChallenge(c, pool).length > 0);
  const list = solvable.length >= GRID_CELLS ? solvable : CHALLENGES;
  // Deterministic shuffle based on seed so the same card layout is reproducible.
  const rng = mulberry32(seed);
  const shuffled = [...list].sort(() => rng() - 0.5);
  const picked = shuffled.slice(0, GRID_CELLS);
  // If we still don't have 25 (very small pool) pad by cycling.
  while (picked.length < GRID_CELLS) {
    picked.push(shuffled[picked.length % shuffled.length]);
  }
  return picked.map((c) => c.id);
}

/** Fresh squares aligned with challengeIds. */
export function emptySquares(challengeIds: string[]): BingoSquare[] {
  return challengeIds.map((challengeId) => ({ challengeId, completed: false }));
}

/** Does the user's pick satisfy the square's challenge? */
export function canPickBookForSquare(square: BingoSquare, book: Book): boolean {
  const challenge = CHALLENGE_BY_ID[square.challengeId];
  if (!challenge) return false;
  return bookMatchesChallenge(book, challenge);
}

/** Indices that are currently part of a completed line. */
export function getWinningCells(squares: BingoSquare[]): Set<number> {
  const winners = new Set<number>();
  for (const line of WINNING_LINES) {
    if (line.every((i) => squares[i]?.completed)) {
      line.forEach((i) => winners.add(i));
    }
  }
  return winners;
}

export function countBingos(squares: BingoSquare[]): number {
  return WINNING_LINES.filter((line) => line.every((i) => squares[i]?.completed)).length;
}

export function bingoProgress(squares: BingoSquare[]): { done: number; total: number; pct: number } {
  const done = squares.filter((s) => s.completed).length;
  const total = squares.length || GRID_CELLS;
  return { done, total, pct: Math.round((done / total) * 100) };
}

/** Resolve a square to its picked book (may be undefined). */
export function getBookForSquare(square: BingoSquare | undefined): Book | undefined {
  if (!square?.bookId) return undefined;
  return BOOK_BY_ID[square.bookId];
}

/** Fresh in-memory card — persisted via the storage layer. */
export function makeEmptyCard(params: { id: string; userId: string; title: string; pool: Book[]; seed?: number; createdAt?: string }): BingoCard {
  const challengeIds = generateChallengeIds(params.pool, params.seed);
  const now = new Date().toISOString();
  const createdAt = params.createdAt ?? now;
  return {
    id: params.id,
    userId: params.userId,
    title: params.title,
    challengeIds,
    squares: emptySquares(challengeIds),
    createdAt,
    updatedAt: now,
  };
}

// Tiny seeded PRNG so a given seed produces a stable card layout.
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
