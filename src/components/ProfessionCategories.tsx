import { PROFESSIONS } from '../data/professions';
import { useApp } from '../context/AppContext';

export default function ProfessionCategories() {
  const { selectedProfession, setProfession } = useApp();

  const scrollToTrending = () =>
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      className="py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0B1A 0%, #1A1030 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="font-body text-primary-400 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Curated for you
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-0.5">
              Browse by profession
            </h2>
          </div>
          {selectedProfession && (
            <button
              onClick={() => setProfession(undefined)}
              className="font-body text-[11px] font-semibold transition-colors"
              style={{ color: 'rgba(167,139,250,0.8)' }}
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
                className="relative text-left p-3.5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(168,85,247,0.3) 100%)',
                        border: '1px solid rgba(167,139,250,0.5)',
                        boxShadow: '0 6px 25px rgba(124,58,237,0.35)',
                      }
                    : {
                        background: 'rgba(29,16,56,0.5)',
                        border: '1px solid rgba(124,58,237,0.15)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      }
                }
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${prof.color} flex items-center justify-center text-base shadow-sm`}
                  >
                    {prof.icon}
                  </div>
                  <span
                    className="font-body text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={
                      active
                        ? { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }
                        : { background: 'rgba(124,58,237,0.12)', color: 'rgba(167,139,250,0.8)' }
                    }
                  >
                    {active ? 'Active' : prof.tag}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm leading-tight mb-0.5 text-white">
                  {prof.name}
                </h3>
                <p className="font-body text-[10px] line-clamp-1 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
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
