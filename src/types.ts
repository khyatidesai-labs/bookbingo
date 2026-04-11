// Core domain types for Book Bingo.

export type Mood =
  | 'feel-good'
  | 'dark-deep'
  | 'motivational'
  | 'romantic'
  | 'mind-bending';

export type Profession =
  | 'designer'
  | 'developer'
  | 'entrepreneur'
  | 'lawyer'
  | 'doctor'
  | 'educator'
  | 'scientist';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string; // URL
  description: string;
  pages: number;
  year: number;
  genres: string[];
  moods: Mood[];
  professions: Profession[];
  /** Free-form lowercase tags used for bingo-challenge matching. */
  tags: string[];
  isbn?: string;
}

/**
 * A Bingo challenge is serialisable data, not a function, so it can live in
 * the DB and be synced across clients. Matching is done by checking any of
 * the optional criteria arrays — a book satisfies the challenge if it matches
 * at least one condition from each non-empty criterion.
 */
export interface BingoChallenge {
  id: string;
  label: string;
  longLabel?: string;
  matchTags?: string[];
  matchMoods?: Mood[];
  matchGenres?: string[];
  matchProfessions?: Profession[];
  minPages?: number;
  maxPages?: number;
  beforeYear?: number;
  afterYear?: number;
}

export interface BingoSquare {
  challengeId: string;
  bookId?: string;
  completed: boolean;
}

export interface BingoCard {
  id: string;
  userId: string;
  title: string;
  /** Stable challenge ids for each cell (length 25, row-major 5x5). */
  challengeIds: string[];
  /** User state for each cell (length 25, aligned with challengeIds). */
  squares: BingoSquare[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  profession?: Profession;
  moods: Mood[];
  savedBookIds: string[];
  /** True when this is a Supabase anonymous user or a local fallback id. */
  isGuest?: boolean;
}

export interface BookRecommendation {
  id: string;
  fromUser: string;
  fromName: string;
  toUser: string;
  bookId: string;
  note: string;
  status: 'pending' | 'saved' | 'dismissed';
  createdAt: string;
}

export interface CurrentlyReading {
  userId: string;
  userName?: string;
  bookId: string;
  status: 'reading' | 'finished';
  startedAt: string;
}

export interface CommunityRoom {
  id: string;
  code: string;
  name: string;
  topic: string;
  memberCount: number;
  createdAt: string;
}

export interface CommunityMessage {
  id: string;
  roomId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
