import { ArrowRight } from 'lucide-react';

const collections = [
  {
    title: 'Shadows of Sicily',
    subtitle: 'Travel & Photography',
    description:
      'Cobblestone streets, light, architecture, and quiet longing.',
    tags: ['Travel', 'Photography'],
    bookCount: 18,
    image:
      'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Design Thinking',
    subtitle: 'For Creatives & Builders',
    description:
      'The systems behind beautiful, functional things.',
    tags: ['Design', 'Systems'],
    bookCount: 24,
    image:
      'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Midnight Philosophy',
    subtitle: 'Late Night Thinkers',
    description:
      'Questions that keep you up at night, answered.',
    tags: ['Philosophy', 'Essays'],
    bookCount: 31,
    image:
      'https://images.pexels.com/photos/3646180/pexels-photo-3646180.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

/**
 * Compact editorial picks rail. Three small cards in a row on desktop,
 * single column on mobile. Replaces the earlier full-bleed alternating
 * layout that dominated the page.
 */
export default function FeaturedCollections() {
  return (
    <section className="py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <span className="font-body text-accent-500 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Editorial Picks
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-primary-900 mt-0.5">
              Curated Collections
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {collections.map((col) => (
            <button
              key={col.title}
              className="group relative bg-white rounded-xl overflow-hidden border border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="relative h-28 overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/20 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="font-body text-[9px] font-semibold text-white/80 uppercase tracking-wider">
                    {col.subtitle}
                  </p>
                  <h3 className="font-heading text-sm font-bold text-white leading-tight line-clamp-1">
                    {col.title}
                  </h3>
                </div>
              </div>

              <div className="p-3">
                <p className="font-body text-[11px] text-primary-500 leading-snug line-clamp-2 mb-2">
                  {col.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-[9px] font-medium text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 font-body text-[10px] font-semibold text-primary-900 group-hover:text-accent-600 transition-colors">
                    {col.bookCount}
                    <ArrowRight
                      size={11}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
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
