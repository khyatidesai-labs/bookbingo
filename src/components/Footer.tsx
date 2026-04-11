import { BookOpen, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-primary-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-primary-900">Book Bingo</span>
            </div>
            <p className="font-body text-primary-400 text-sm leading-relaxed max-w-xs">
              The reading community that makes books addictive. Discover, track, and compete with fellow readers.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: <Instagram size={16} />, label: 'Instagram' },
                { icon: <Twitter size={16} />, label: 'Twitter' },
                { icon: <Linkedin size={16} />, label: 'LinkedIn' },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-primary-200 flex items-center justify-center text-primary-400 hover:text-primary-900 hover:border-primary-400 transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-body font-semibold text-primary-900 text-sm mb-4">Discover</h4>
            <ul className="space-y-3">
              {['Trending Books', 'By Profession', 'By Mood', 'Collections', 'New Releases'].map((item) => (
                <li key={item}>
                  <button className="font-body text-sm text-primary-400 hover:text-primary-700 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-primary-900 text-sm mb-4">Community</h4>
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
                    className="font-body text-sm text-primary-400 hover:text-primary-700 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-primary-300">
            &copy; {new Date().getFullYear()} Book Bingo. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['About', 'Contact', 'Privacy', 'Terms'].map((link) => (
              <button
                key={link}
                className="font-body text-xs text-primary-400 hover:text-primary-700 transition-colors"
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
