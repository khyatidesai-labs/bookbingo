import { ArrowRight } from 'lucide-react';

const collections = [
  {
    title: 'Shadows of Sicily',
    subtitle: 'Travel & Photography',
    description: 'Cobblestone streets, light, architecture, and quiet longing.',
    tags: ['Travel', 'Photography'],
    bookCount: 18,
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Design Thinking',
    subtitle: 'For Creatives & Builders',
    description: 'The systems behind beautiful, functional things.',
    tags: ['Design', 'Systems'],
    bookCount: 24,
    image: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Midnight Philosophy',
    subtitle: 'Late Night Thinkers',
    description: 'Questions that keep you up at night, answered.',
    tags: ['Philosophy', 'Essays'],
    bookCount: 31,
    image: 'https://images.pexels.com/photos/3646180/pexels-photo-3646180.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function FeaturedCollections() {
  return (
    <section
      className="py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0B1A 0%, #1A1030 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-2">
          <div>
            <span className="font-body text-primary-400 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Editorial Picks
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-0.5">
              Curated Collections
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <button
              key={col.title}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1.5"
              style={{
                border: '1px solid rgba(124,58,237,0.18)',
                background: 'rgba(29,16,56,0.6)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1030]/90 via-[#1A1030]/30 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="font-body text-[9px] font-semibold text-white/60 uppercase tracking-wider mb-0.5">
                    {col.subtitle}
                  </p>
                  <h3 className="font-heading text-sm font-bold text-white leading-tight line-clamp-1">
                    {col.title}
                  </h3>
                </div>
              </div>

              <div className="p-3.5">
                <p className="font-body text-[11px] leading-snug line-clamp-2 mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {col.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-[9px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.25)',
                          color: 'rgba(167,139,250,0.9)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 font-body text-[10px] font-semibold text-primary-400 group-hover:text-primary-300 transition-colors">
                    {col.bookCount}
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
