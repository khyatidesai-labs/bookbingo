import type { BingoChallenge } from '../types';

/**
 * Pool of reading challenges used to fill a 5x5 bingo card. Each challenge
 * has matching criteria so a book can be checked against it. More challenges
 * than squares so different cards feel distinct.
 */
export const CHALLENGES: BingoChallenge[] = [
  { id: 'mystery',       label: 'Mystery',       longLabel: 'A mystery or thriller',       matchGenres: ['Mystery', 'Thriller'] },
  { id: 'fantasy',       label: 'Fantasy',       longLabel: 'A fantasy world',             matchGenres: ['Fantasy', 'Epic'] },
  { id: 'sci-fi',        label: 'Sci-Fi',        longLabel: 'Science fiction',             matchGenres: ['Science Fiction'] },
  { id: 'romance',       label: 'Romance',       longLabel: 'A love story',                matchGenres: ['Romance'] },
  { id: 'memoir',        label: 'Memoir',        longLabel: 'A memoir',                    matchGenres: ['Memoir'], matchTags: ['memoir'] },
  { id: 'classic',       label: 'Classic',       longLabel: 'Published before 1980',       beforeYear: 1980 },
  { id: 'modern',        label: 'Modern',        longLabel: 'Published after 2015',        afterYear: 2015 },
  { id: 'short',         label: 'Short',         longLabel: 'Under 300 pages',             maxPages: 300 },
  { id: 'chunky',        label: 'Chunky',        longLabel: 'Over 500 pages',              minPages: 500 },
  { id: 'award-winner',  label: 'Award Winner',  longLabel: 'An award-winning book',       matchTags: ['award-winner'] },
  { id: 'bestseller',    label: 'Bestseller',    longLabel: 'A bestseller',                matchTags: ['bestseller'] },
  { id: 'debut',         label: 'Debut Author',  longLabel: 'A debut novel',               matchTags: ['debut'] },
  { id: 'non-fiction',   label: 'Non-fiction',   longLabel: 'A non-fiction book',          matchTags: ['non-fiction'] },
  { id: 'feel-good',     label: 'Feel Good',     longLabel: 'A feel-good read',            matchMoods: ['feel-good'] },
  { id: 'dark-deep',     label: 'Dark & Deep',   longLabel: 'Something dark and deep',     matchMoods: ['dark-deep'] },
  { id: 'motivational',  label: 'Motivational',  longLabel: 'A motivational read',         matchMoods: ['motivational'] },
  { id: 'mind-bending',  label: 'Mind-Bending',  longLabel: 'A mind-bending read',         matchMoods: ['mind-bending'] },
  { id: 'for-designers', label: 'For Designers', longLabel: 'Picked for designers',        matchProfessions: ['designer'] },
  { id: 'for-devs',      label: 'For Developers', longLabel: 'Picked for developers',      matchProfessions: ['developer'] },
  { id: 'for-founders',  label: 'For Founders',  longLabel: 'Picked for founders',         matchProfessions: ['entrepreneur'] },
  { id: 'for-lawyers',   label: 'For Lawyers',   longLabel: 'Picked for lawyers',          matchProfessions: ['lawyer'] },
  { id: 'for-doctors',   label: 'For Doctors',   longLabel: 'Picked for doctors',          matchProfessions: ['doctor'] },
  { id: 'for-educators', label: 'For Educators', longLabel: 'Picked for educators',        matchProfessions: ['educator'] },
  { id: 'for-scientists', label: 'For Scientists', longLabel: 'Picked for scientists',     matchProfessions: ['scientist'] },
  { id: 'history',       label: 'History',       longLabel: 'A history book',              matchGenres: ['History', 'Anthropology'] },
  { id: 'psychology',    label: 'Psychology',    longLabel: 'A psychology book',           matchGenres: ['Psychology'] },
  { id: 'craft',         label: 'Craft',         longLabel: 'About the craft of work',     matchGenres: ['Craft', 'Design'], matchTags: ['technical'] },
  { id: 'startup',       label: 'Startup',       longLabel: 'About building a company',    matchGenres: ['Business', 'Startup'] },
  { id: 'dystopia',      label: 'Dystopia',      longLabel: 'A dystopian story',           matchGenres: ['Dystopia'] },
];

export const CHALLENGE_BY_ID: Record<string, BingoChallenge> = CHALLENGES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<string, BingoChallenge>,
);
