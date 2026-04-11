import { Check } from 'lucide-react';
import { MOODS } from '../data/moods';
import { useApp } from '../context/AppContext';

export default function MoodSection() {
  const { selectedMoods, toggleMood } = useApp();

  const scrollToTrending = () => {
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-body text-accent-500 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Reading Moods
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-primary-900 mt-0.5">
              Based on Your Mood
            </h2>
          </div>
          {selectedMoods.length > 0 && (
            <span className="hidden md:inline font-body text-[11px] text-primary-500">
              {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
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
                  className={`relative h-52 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    active ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-[#F8FAFC]' : ''
                  }`}
                >
                  <img
                    src={mood.image}
                    alt={mood.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${mood.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-heading font-bold text-white text-base leading-tight mb-0.5">
                      {mood.title}
                    </h3>
                    <p className="font-body text-white/75 text-[10px] leading-snug line-clamp-2">
                      {mood.description}
                    </p>
                  </div>

                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                      active
                        ? 'bg-accent-500 text-white'
                        : 'bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {active ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <span className="text-[11px] font-bold">+</span>
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
