import { PROFESSIONS } from '../data/professions';
import { useApp } from '../context/AppContext';

/**
 * Compact profession picker. On desktop it's a 4×2 card grid, on mobile a
 * horizontal-scroll chip row. Each card is tappable with a gradient icon
 * block and a tag line. Active state pops with a dark header band.
 */
export default function ProfessionCategories() {
  const { selectedProfession, setProfession } = useApp();

  const scrollToTrending = () =>
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="discover" className="py-8 bg-white border-y border-primary-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <span className="font-body text-accent-500 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Curated for you
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-primary-900 mt-0.5">
              Browse by profession
            </h2>
          </div>
          {selectedProfession && (
            <button
              onClick={() => setProfession(undefined)}
              className="font-body text-[11px] font-semibold text-primary-500 hover:text-primary-900 underline underline-offset-4"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PROFESSIONS.map((prof) => {
            const active = selectedProfession === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => {
                  setProfession(active ? undefined : prof.id);
                  if (!active) scrollToTrending();
                }}
                className={`relative text-left p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                  active
                    ? 'bg-primary-900 border-primary-900 shadow-lg shadow-primary-900/10'
                    : 'bg-white border-primary-100 hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${prof.color} flex items-center justify-center text-base shadow-sm`}
                  >
                    {prof.icon}
                  </div>
                  <span
                    className={`font-body text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'bg-primary-50 text-primary-500'
                    }`}
                  >
                    {active ? 'Active' : prof.tag}
                  </span>
                </div>
                <h3
                  className={`font-heading font-bold text-sm leading-tight mb-0.5 ${
                    active ? 'text-white' : 'text-primary-900'
                  }`}
                >
                  {prof.name}
                </h3>
                <p
                  className={`font-body text-[10px] line-clamp-1 leading-snug ${
                    active ? 'text-white/60' : 'text-primary-500'
                  }`}
                >
                  {prof.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
