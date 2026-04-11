import { ArrowRight, Sparkles, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOKS } from '../data/books';
import { getOptimizedImageProps } from '../lib/imageOptimization';

/**
 * Compact editorial hero. Leads with a short headline, a clear primary CTA,
 * and a live proof point — three overlapping book covers + a count of
 * readers online right now. On tap, the covers open the book modal so the
 * hero itself becomes a browse surface.
 */
export default function Hero() {
  const { openBook, reading } = useApp();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Three "cover stack" books — prefer books the user is currently reading,
  // fall back to a curated highlight set so the hero never looks empty.
  const featured = (() => {
    if (reading.length >= 3) {
      return reading.slice(0, 3).map((r) => BOOKS.find((b) => b.id === r.bookId)!).filter(Boolean);
    }
    // Use real IDs from the generated catalogue, fall back to the first
    // few books if any of these go missing after a regeneration.
    const picks = ['atomic-habits-clear', 'sapiens-harari', 'pragmatic-thinking-and-learning-hunt'];
    const resolved = picks
      .map((id) => BOOKS.find((b) => b.id === id))
      .filter(Boolean) as typeof BOOKS;
    return resolved.length === 3 ? resolved : BOOKS.slice(0, 3);
  })();

  return (
    <section className="relative pt-20 pb-10 md:pt-24 md:pb-12 overflow-hidden bg-gradient-to-br from-primary-900 via-[#14142B] to-primary-800">
      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/3 w-[28rem] h-[28rem] bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[24rem] h-[24rem] bg-rose-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-8 items-center">
          {/* LEFT — headline + CTA */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="font-body text-white/80 text-[11px] font-medium tracking-wide">
                248 readers online now
              </span>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-[1.05] mb-3 tracking-tight">
              Read together.
              <span className="italic bg-gradient-to-r from-accent-300 via-pink-200 to-accent-300 bg-clip-text text-transparent">
                {' '}Never alone.
              </span>
            </h1>

            <p className="font-body text-white/65 text-sm md:text-base max-w-lg mb-5 leading-relaxed">
              Discover books by mood and profession, and swap recommendations with friends in real time.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => scrollTo('shelf')}
                className="group font-body font-semibold px-4 py-2 bg-white text-primary-900 rounded-full hover:bg-primary-50 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-1.5 text-xs"
              >
                Open my shelf
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
              <button
                onClick={() => scrollTo('bingo')}
                className="font-body font-semibold px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full hover:bg-white/15 transition-all duration-200 text-xs flex items-center gap-1.5"
              >
                <Sparkles size={12} className="text-accent-300" />
                Start Bingo
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4 text-white/60">
              <div>
                <p className="font-heading text-lg font-bold text-white leading-none">500+</p>
                <p className="font-body text-[10px] mt-0.5">curated books</p>
              </div>
              <div className="h-7 w-px bg-white/15" />
              <div>
                <p className="font-heading text-lg font-bold text-white leading-none">7</p>
                <p className="font-body text-[10px] mt-0.5">professions</p>
              </div>
              <div className="h-7 w-px bg-white/15" />
              <div>
                <p className="font-heading text-lg font-bold text-white leading-none">live</p>
                <p className="font-body text-[10px] mt-0.5">recommendations</p>
              </div>
            </div>
          </div>

          {/* RIGHT — book cover stack */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-transparent rounded-[2.5rem] blur-2xl" />
            <div className="relative">
              {/* three stacked covers */}
              <div className="relative h-64 flex items-center justify-center">
                {featured.map((book, i) => {
                  const offsets = [
                    { rotate: '-rotate-6', translate: '-translate-x-20 translate-y-1', z: 'z-10' },
                    { rotate: 'rotate-0', translate: '', z: 'z-20 scale-110' },
                    { rotate: 'rotate-6', translate: 'translate-x-20 translate-y-1', z: 'z-10' },
                  ];
                  const o = offsets[i];
                  return (
                    <button
                      key={book.id}
                      onClick={() => openBook(book.id)}
                      className={`absolute ${o.translate} ${o.rotate} ${o.z} transform transition-transform duration-300 hover:scale-[1.15] hover:-translate-y-2`}
                    >
                      <div className="w-28 h-40 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <img
                          {...getOptimizedImageProps(book.cover, 'hero')}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* floating stat pill */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/10 backdrop-blur-lg border border-white/15 rounded-full px-3 py-1.5 shadow-xl">
                <div className="flex -space-x-1.5">
                  {['E', 'J', 'M'].map((l, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border-2 border-primary-900 text-[8px] font-bold flex items-center justify-center"
                      style={{
                        background: ['#a5b4fc', '#f9a8d4', '#86efac'][i],
                        color: '#0F172A',
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <Users size={10} className="text-white/70" />
                <span className="font-body text-[10px] text-white/90 font-medium">
                  reading these now
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
