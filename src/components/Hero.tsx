import { ArrowRight, Sparkles, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOKS } from '../data/books';
import { getOptimizedImageProps } from '../lib/imageOptimization';

export default function Hero() {
  const { openBook, reading, readers } = useApp();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const featured = (() => {
    if (reading.length >= 3) {
      return reading.slice(0, 3).map((r) => BOOKS.find((b) => b.id === r.bookId)!).filter(Boolean);
    }
    const picks = ['atomic-habits-clear', 'sapiens-harari', 'the-pragmatic-programmer-thomas'];
    const resolved = picks.map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean) as typeof BOOKS;
    return resolved.length === 3 ? resolved : BOOKS.slice(0, 3);
  })();

  return (
    <section
      className="relative pt-20 pb-14 md:pt-28 md:pb-20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #080511 0%, #0F0B1A 30%, #1A1030 65%, #2D1B69 90%, #1A1030 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />
        <div className="absolute top-[-10%] left-[-5%] w-[55rem] h-[55rem] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 65%)' }} />
        <div className="absolute top-0 right-[-5%] w-[30rem] h-[30rem] rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] left-[35%] w-[40rem] h-[30rem] rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.8) 0%, transparent 65%)' }} />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(167,139,250,0.8) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">

          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(10px)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-body text-white/75 text-[11px] font-medium tracking-wide">
                {readers.length} {readers.length === 1 ? 'reader' : 'readers'} online now
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-[1.05] mb-5 tracking-tight">
              Read together.
              <br />
              <span className="text-gradient-purple italic">Never alone.</span>
            </h1>

            <p className="font-body text-white/55 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
              Discover books matched to your mood and profession. Track your progress, swap recommendations, and play monthly bingo challenges with your reading circle.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <button
                onClick={() => scrollTo('shelf')}
                className="group font-body font-semibold px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 text-sm"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%)',
                  color: '#0F0B1A',
                  boxShadow: '0 8px 30px rgba(167,139,250,0.4)',
                }}
              >
                Open my shelf
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('bingo')}
                className="font-body font-semibold px-6 py-3 rounded-full text-white text-sm flex items-center gap-2 transition-all duration-200 hover:bg-white/10"
                style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', backdropFilter: 'blur(10px)' }}
              >
                <Sparkles size={13} className="text-accent-300" />
                Start Bingo
              </button>
            </div>

            <div className="flex items-center gap-6 text-white/45">
              <div>
                <p className="font-heading text-2xl font-bold text-white leading-none">500+</p>
                <p className="font-body text-[11px] mt-0.5 text-white/45">curated books</p>
              </div>
              <div className="h-8 w-px" style={{ background: 'rgba(124,58,237,0.3)' }} />
              <div>
                <p className="font-heading text-2xl font-bold text-white leading-none">7</p>
                <p className="font-body text-[11px] mt-0.5 text-white/45">professions</p>
              </div>
              <div className="h-8 w-px" style={{ background: 'rgba(124,58,237,0.3)' }} />
              <div>
                <p className="font-heading text-2xl font-bold text-white leading-none">live</p>
                <p className="font-body text-[11px] mt-0.5 text-white/45">recommendations</p>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div
              className="absolute inset-0 rounded-[3rem] blur-3xl opacity-35"
              style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.6) 0%, rgba(192,132,252,0.2) 50%, transparent 75%)' }}
            />
            <div className="relative h-72 flex items-center justify-center">
              {featured.map((book, i) => {
                const offsets = [
                  { rotate: '-rotate-6', translate: '-translate-x-20 translate-y-2', z: 'z-10' },
                  { rotate: 'rotate-0', translate: '', z: 'z-20 scale-110' },
                  { rotate: 'rotate-6', translate: 'translate-x-20 translate-y-2', z: 'z-10' },
                ];
                const o = offsets[i];
                const shadows = [
                  '0 20px 50px rgba(124,58,237,0.35)',
                  '0 30px 80px rgba(124,58,237,0.55)',
                  '0 20px 50px rgba(192,132,252,0.35)',
                ];
                return (
                  <button
                    key={book.id}
                    onClick={() => openBook(book.id)}
                    className={`absolute ${o.translate} ${o.rotate} ${o.z} transform transition-all duration-300 hover:scale-[1.15] hover:-translate-y-3`}
                  >
                    <div
                      className="w-28 h-40 rounded-xl overflow-hidden"
                      style={{ boxShadow: shadows[i], border: '1px solid rgba(167,139,250,0.2)' }}
                    >
                      <img
                        {...getOptimizedImageProps(book.cover, 'hero')}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                );
              })}

              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2"
                style={{ background: 'rgba(29,16,56,0.92)', border: '1px solid rgba(124,58,237,0.35)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(124,58,237,0.25)' }}
              >
                <div className="flex -space-x-1.5">
                  {['E', 'J', 'M'].map((l, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border-2 text-[8px] font-bold flex items-center justify-center"
                      style={{
                        background: ['#A78BFA', '#F9A8D4', '#86efac'][i],
                        color: '#0F0B1A',
                        borderColor: '#1A1030',
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <Users size={10} className="text-white/50" />
                <span className="font-body text-[10px] text-white/75 font-medium">reading these now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
