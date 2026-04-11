import { BookMarked, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A1030 0%, #080511 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), transparent)' }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50rem] h-48 rounded-full blur-3xl opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', boxShadow: '0 4px 15px rgba(124,58,237,0.5)' }}
              >
                <BookMarked size={17} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-xl tracking-tight text-white leading-none">
                  Book<span className="text-gradient-purple">Bingo</span>
                </span>
                <span className="font-body text-[9px] text-white/35 tracking-[0.2em] uppercase font-medium mt-0.5">
                  Read Together
                </span>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              The reading community that makes books addictive. Discover, track, and compete with fellow readers.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: <Instagram size={15} />, label: 'Instagram' },
                { icon: <Twitter size={15} />, label: 'Twitter' },
                { icon: <Linkedin size={15} />, label: 'LinkedIn' },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.25)';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.12)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-4">Discover</h4>
            <ul className="space-y-3">
              {['Trending Books', 'By Profession', 'By Mood', 'Collections', 'New Releases'].map((item) => (
                <li key={item}>
                  <button
                    className="font-body text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-4">Community</h4>
            <ul className="space-y-3">
              {[
                { label: 'Bingo Challenge', id: 'bingo' },
                { label: 'Create a Room', id: 'community' },
                { label: 'Leaderboard', id: 'community' },
                { label: 'Reading Groups', id: 'community' },
              ].map(({ label, id }) => (
                <li key={label}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="font-body text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}
        >
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; {new Date().getFullYear()} Book Bingo. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['About', 'Contact', 'Privacy', 'Terms'].map((link) => (
              <button
                key={link}
                className="font-body text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)')}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
