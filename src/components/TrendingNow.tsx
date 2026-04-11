import { TrendingUp, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROFESSION_BY_ID } from '../data/professions';
import { MOOD_BY_ID } from '../data/moods';
import BookCard from './BookCard';

/**
 * Trending / recommendations section. Horizontal-scroll rail with snap,
 * an inline filter chip row that reflects the active profession + moods
 * and lets the user clear each with one tap, and a compact header.
 */
export default function TrendingNow() {
  const {
    recommendations,
    selectedProfession,
    selectedMoods,
    setProfession,
    toggleMood,
    clearFilters,
    openBook,
  } = useApp();

  const hasFilters = Boolean(selectedProfession || selectedMoods.length);
  const activeProfession = selectedProfession ? PROFESSION_BY_ID[selectedProfession] : null;

  return (
    <section id="trending" className="py-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {hasFilters ? (
                <Sparkles size={13} className="text-accent-500" />
              ) : (
                <TrendingUp size={13} className="text-accent-500" />
              )}
              <span className="font-body text-accent-500 text-[10px] font-semibold uppercase tracking-[0.2em]">
                {hasFilters ? 'Matched for you' : 'Right now'}
              </span>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-primary-900 leading-tight">
              {hasFilters ? 'Your recommendations' : 'Trending this week'}
            </h2>
          </div>

          {/* Filter chip row */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeProfession && (
                <button
                  onClick={() => setProfession(undefined)}
                  className="group font-body text-[11px] font-medium bg-white border border-primary-200 text-primary-700 pl-2 pr-1.5 py-1 rounded-full flex items-center gap-1.5 hover:border-primary-400"
                >
                  <span>{activeProfession.icon}</span>
                  {activeProfession.name}
                  <X size={10} className="text-primary-400 group-hover:text-primary-700" />
                </button>
              )}
              {selectedMoods.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMood(m)}
                  className="group font-body text-[11px] font-medium bg-accent-50 border border-accent-200 text-accent-700 pl-2 pr-1.5 py-1 rounded-full flex items-center gap-1.5 hover:border-accent-400"
                >
                  {MOOD_BY_ID[m].title}
                  <X size={10} className="text-accent-400 group-hover:text-accent-700" />
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="font-body text-[11px] font-semibold text-primary-500 hover:text-primary-900 px-2 py-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-primary-100">
            <p className="font-heading font-semibold text-primary-700">
              No matches for that combination yet.
            </p>
            <p className="font-body text-primary-500 text-sm mt-1">
              Try removing a mood or switching profession.
            </p>
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {recommendations.map(({ book, reasons }) => (
              <div key={book.id} className="snap-start">
                <BookCard
                  book={book}
                  tag={reasons[0] ?? 'Trending'}
                  onClick={() => openBook(book.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
