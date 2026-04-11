import { Check } from 'lucide-react';
import { MOODS } from '../data/moods';
import { useApp } from '../context/AppContext';

export default function MoodSection() {
  const { selectedMoods, toggleMood } = useApp();

  const scrollToTrending = () => {
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-10 relative overflow-hidden" style={{ background: '#0F0B1A' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full blur-3xl opacity-[0.06]" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-body text-primary-400 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Reading Moods
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-0.5">
              Based on your mood
            </h2>
          </div>
          {selectedMoods.length > 0 && (
            <span
              className="hidden md:inline font-body text-[11px] font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
          {MOODS.map((mood) => {
            const active = selectedMoods.includes(mood.id);
            return (
              <button
                key={mood.id}
                onClick={() => {
                  toggleMood(mood.id);
                  scrollToTrending();
                }}
                className="flex-none w-40 md:w-44 group cursor-pointer text-left"
              >
                <div
                  className="relative h-52 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                  style={{
                    boxShadow: active ? '0 8px 30px rgba(124,58,237,0.5)' : '0 4px 15px rgba(0,0,0,0.4)',
                    border: active ? '2px solid rgba(167,139,250,0.6)' : '1px solid rgba(124,58,237,0.12)',
                  }}
                >
                  <img
                    src={mood.image}
                    alt={mood.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${mood.gradient}`} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,11,26,0.85) 0%, rgba(15,11,26,0.1) 55%, transparent 100%)' }} />

                  {active && (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), transparent 60%)' }} />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-heading font-bold text-white text-sm leading-tight mb-0.5">{mood.title}</h3>
                    <p className="font-body text-white/60 text-[10px] leading-snug line-clamp-2">{mood.description}</p>
                  </div>

                  <div
                    className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                      active ? '' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={active
                      ? { background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 2px 10px rgba(124,58,237,0.6)' }
                      : { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }
                    }
                  >
                    {active ? (
                      <Check size={11} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="text-white text-[11px] font-bold">+</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
