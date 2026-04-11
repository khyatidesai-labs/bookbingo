import { useState, useEffect } from 'react';
import { Compass, Briefcase, Sparkles, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  fetchBooksByProfession,
  fetchBooksByMood,
  searchBooks,
} from '../lib/openLibraryService';
import { PROFESSION_BY_ID } from '../data/professions';
import { MOOD_BY_ID } from '../data/moods';
import { CHALLENGE_BY_ID } from '../data/bingoChallenges';
import BookCard from './BookCard';
import type { Book } from '../types';

type BrowseMode = 'profession' | 'mood' | 'challenge' | null;

/**
 * Discover Section — Browse books by:
 * - Profession (developer, designer, entrepreneur, etc.)
 * - Mood (feel-good, dark-deep, motivational, romantic, mind-bending)
 * - Bingo Challenges (reading challenges from the bingo system)
 */
export default function DiscoverSection() {
  const { openBook } = useApp();
  const [browseMode, setBrowseMode] = useState<BrowseMode>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch books when filter changes
  useEffect(() => {
    if (!selectedFilter) return;

    setLoading(true);
    const fetchBooks = async () => {
      let results: Book[] = [];

      if (browseMode === 'profession') {
        results = await fetchBooksByProfession(selectedFilter);
      } else if (browseMode === 'mood') {
        results = await fetchBooksByMood(selectedFilter);
      } else if (browseMode === 'challenge') {
        // For challenges, search by the challenge label
        const challenge = CHALLENGE_BY_ID[selectedFilter];
        if (challenge) {
          results = await searchBooks(challenge.label);
        }
      }

      setBooks(results);
      setLoading(false);
    };

    fetchBooks();
  }, [selectedFilter, browseMode]);

  const professions = Object.values(PROFESSION_BY_ID);
  const moods = Object.values(MOOD_BY_ID);
  const challenges = Object.values(CHALLENGE_BY_ID).slice(0, 12); // Limit to 12 for display

  return (
    <section id="discover" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Compass size={16} className="text-accent-500" />
            <span className="font-body text-accent-500 text-[11px] font-semibold uppercase tracking-[0.2em]">
              Discover
            </span>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-900">
            Browse by Your Interests
          </h2>
        </div>

        {/* Browse Mode Selector */}
        {!browseMode ? (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Browse by Profession */}
            <button
              onClick={() => setBrowseMode('profession')}
              className="group p-6 rounded-2xl border border-primary-200 hover:border-primary-900 hover:bg-primary-50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <Briefcase size={18} className="text-accent-600" />
                </div>
              </div>
              <h3 className="font-heading font-bold text-primary-900 text-lg mb-1">
                By Profession
              </h3>
              <p className="font-body text-primary-500 text-sm">
                Find books curated for {professions.length} different careers
              </p>
            </button>

            {/* Browse by Mood */}
            <button
              onClick={() => setBrowseMode('mood')}
              className="group p-6 rounded-2xl border border-primary-200 hover:border-primary-900 hover:bg-primary-50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <Sparkles size={18} className="text-accent-600" />
                </div>
              </div>
              <h3 className="font-heading font-bold text-primary-900 text-lg mb-1">
                By Mood
              </h3>
              <p className="font-body text-primary-500 text-sm">
                Pick your reading mood: uplifting, dark, mind-bending, romantic
              </p>
            </button>

            {/* Browse by Challenge */}
            <button
              onClick={() => setBrowseMode('challenge')}
              className="group p-6 rounded-2xl border border-primary-200 hover:border-primary-900 hover:bg-primary-50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <Trophy size={18} className="text-accent-600" />
                </div>
              </div>
              <h3 className="font-heading font-bold text-primary-900 text-lg mb-1">
                By Challenge
              </h3>
              <p className="font-body text-primary-500 text-sm">
                Browse books by Bingo challenge categories
              </p>
            </button>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => {
                setBrowseMode(null);
                setSelectedFilter(null);
                setBooks([]);
              }}
              className="mb-6 font-body text-sm font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              ← Back to browse modes
            </button>

            {/* Filter Grid */}
            <div className="mb-8">
              <h3 className="font-heading font-bold text-primary-900 text-lg mb-4">
                {browseMode === 'profession' && 'Select a profession'}
                {browseMode === 'mood' && 'Choose your mood'}
                {browseMode === 'challenge' && 'Pick a reading challenge'}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {browseMode === 'profession' &&
                  professions.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => setSelectedFilter(prof.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedFilter === prof.id
                          ? 'border-accent-500 bg-accent-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-lg mb-1 block">{prof.icon}</span>
                      <p className="font-body text-sm font-semibold text-primary-900">
                        {prof.name}
                      </p>
                    </button>
                  ))}

                {browseMode === 'mood' &&
                  moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedFilter(mood.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedFilter === mood.id
                          ? 'border-accent-500 bg-accent-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-body text-sm font-semibold text-primary-900">
                        {mood.title}
                      </p>
                    </button>
                  ))}

                {browseMode === 'challenge' &&
                  challenges.map((challenge) => (
                    <button
                      key={challenge.id}
                      onClick={() => setSelectedFilter(challenge.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedFilter === challenge.id
                          ? 'border-accent-500 bg-accent-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-body text-[11px] font-semibold text-primary-900 line-clamp-2">
                        {challenge.label}
                      </p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Books Grid */}
            {selectedFilter && (
              <div>
                <h3 className="font-heading font-bold text-primary-900 text-lg mb-4">
                  {loading ? 'Loading books...' : `Found ${books.length} books`}
                </h3>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="font-body text-primary-500">Fetching from Open Library...</p>
                  </div>
                ) : books.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {books.slice(0, 20).map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onClick={() => openBook(book.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-primary-50 rounded-2xl">
                    <p className="font-body text-primary-500">
                      No books found. Try another filter.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
