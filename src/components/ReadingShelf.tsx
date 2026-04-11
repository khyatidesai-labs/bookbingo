import { BookOpen, Inbox, Users, Send, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOK_BY_ID } from '../data/books';

export default function ReadingShelf() {
  const {
    reading,
    inbox,
    unreadCount,
    readers,
    openBook,
    openSavedDrawer,
    openAuthModal,
    profile,
    respondToRec,
    dynamicBook,
  } = useApp();

  const signedIn = Boolean(profile?.email);
  const firstReading = reading[0];
  const currentBook = firstReading
    ? (BOOK_BY_ID[firstReading.bookId] ?? (dynamicBook?.id === firstReading.bookId ? dynamicBook : null))
    : null;

  // Fallback: if we have a reading entry but no book in the database, show a placeholder
  const hasReadingEntry = Boolean(firstReading && !currentBook);

  const topRec = inbox[0];
  const topRecBook = topRec ? BOOK_BY_ID[topRec.bookId] : null;

  return (
    <section
      id="shelf"
      className="py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A1030 0%, #0F0B1A 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-8" style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="font-body text-primary-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
              Your Shelf
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-0.5">
              {signedIn ? `Welcome back, ${profile?.name?.split(' ')[0] ?? 'reader'}` : 'Start your reading circle'}
            </h2>
          </div>
          {!signedIn && (
            <button
              onClick={openAuthModal}
              className="hidden sm:flex font-body text-xs font-semibold px-4 py-2 rounded-full transition-all items-center gap-1.5 text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}
            >
              Sign in
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <ShelfCard
            tint="from-emerald-600/20 to-emerald-500/10"
            borderColor="rgba(16,185,129,0.25)"
            icon={<BookOpen size={14} className="text-emerald-400" />}
            label="Now reading"
            badge={reading.length > 0 ? `${reading.length}` : undefined}
          >
            {currentBook ? (
              <button onClick={() => openBook(currentBook.id)} className="w-full flex gap-3 text-left group">
                <div
                  className="w-14 h-20 rounded-lg overflow-hidden flex-none shadow-lg group-hover:scale-[1.03] transition-transform"
                  style={{ border: '1px solid rgba(167,139,250,0.2)' }}
                >
                  <img src={currentBook.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-white text-sm leading-tight line-clamp-2">{currentBook.title}</p>
                  <p className="font-body text-white/50 text-[11px] mt-0.5 truncate">{currentBook.author}</p>
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full w-1/3 rounded-full" style={{ background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
                  </div>
                  <p className="font-body text-[10px] text-white/40 mt-1.5">In progress · tap to open</p>
                </div>
              </button>
            ) : hasReadingEntry ? (
              <div className="flex flex-col items-start justify-center h-full py-2">
                <p className="font-heading font-semibold text-white text-sm">Book loading...</p>
                <p className="font-body text-white/45 text-[11px] mt-1 leading-snug">Syncing your reading status. Check back in a moment.</p>
              </div>
            ) : (
              <EmptyBlock title="Nothing in progress" sub="Open any book and tap &ldquo;I'm reading&rdquo; to track it here." />
            )}
          </ShelfCard>

          <ShelfCard
            tint="from-pink-500/20 to-pink-400/10"
            borderColor="rgba(236,72,153,0.25)"
            icon={<Inbox size={14} className="text-pink-400" />}
            label="From friends"
            badge={unreadCount > 0 ? `${unreadCount} new` : undefined}
            badgeTone={unreadCount > 0 ? 'hot' : undefined}
          >
            {topRec && topRecBook ? (
              <div className="space-y-2">
                <button onClick={() => openBook(topRecBook.id)} className="w-full flex gap-3 text-left group">
                  <div
                    className="w-14 h-20 rounded-lg overflow-hidden flex-none shadow-lg group-hover:scale-[1.03] transition-transform"
                    style={{ border: '1px solid rgba(167,139,250,0.2)' }}
                  >
                    <img src={topRecBook.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[10px] text-pink-400 font-semibold uppercase tracking-wider">{topRec.fromName} sent</p>
                    <p className="font-heading font-bold text-white text-sm leading-tight line-clamp-2 mt-0.5">{topRecBook.title}</p>
                    {topRec.note && (
                      <p className="font-body text-white/50 text-[11px] italic mt-1 line-clamp-2">&ldquo;{topRec.note}&rdquo;</p>
                    )}
                  </div>
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => respondToRec(topRec.id, 'saved')}
                    className="flex-1 font-body text-[11px] font-semibold py-1.5 rounded-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                  >
                    Save to list
                  </button>
                  <button
                    onClick={openSavedDrawer}
                    className="font-body text-[11px] font-medium py-1.5 px-2.5 rounded-lg text-white/60 hover:text-white transition-colors"
                    style={{ border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    View all
                  </button>
                </div>
              </div>
            ) : (
              <EmptyBlock
                title={signedIn ? 'No recs yet' : 'Sign in to receive recs'}
                sub={signedIn ? 'When a friend sends you a book, it shows up here.' : 'One tap to upgrade your guest session.'}
                action={signedIn ? undefined : { label: 'Sign in', onClick: openAuthModal }}
              />
            )}
          </ShelfCard>

          <ShelfCard
            tint="from-primary-600/20 to-primary-500/10"
            borderColor="rgba(124,58,237,0.3)"
            icon={<Users size={14} className="text-primary-400" />}
            label="Readers online"
            badge={readers.length > 0 ? `${readers.length}` : undefined}
          >
            {readers.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {readers.slice(0, 8).map((r) => (
                    <span
                      key={r.id}
                      title={`${r.name} · ${r.email}`}
                      className="w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-md ring-2"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)', boxShadow: '0 2px 8px rgba(124,58,237,0.4)', ringColor: 'rgba(15,11,26,0.8)' }}
                    >
                      {r.name.slice(0, 1).toUpperCase()}
                    </span>
                  ))}
                  {readers.length > 8 && (
                    <span className="w-8 h-8 rounded-full text-white/60 text-[10px] font-semibold flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                      +{readers.length - 8}
                    </span>
                  )}
                </div>
                <p className="font-body text-[11px] text-white/50 leading-snug mb-3">
                  Tap a book to see who's reading it, or open any title to send a recommendation.
                </p>
                <button
                  onClick={openSavedDrawer}
                  className="w-full font-body text-[11px] font-semibold py-1.5 rounded-lg text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  style={{ border: '1px solid rgba(124,58,237,0.25)' }}
                >
                  <Send size={11} />
                  Browse readers
                </button>
              </div>
            ) : (
              <EmptyBlock title="No other readers yet" sub="Once friends sign in they'll appear here." />
            )}
          </ShelfCard>
        </div>
      </div>
    </section>
  );
}

function ShelfCard({
  tint,
  borderColor,
  icon,
  label,
  badge,
  badgeTone,
  children,
}: {
  tint: string;
  borderColor: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeTone?: 'hot';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-4 min-h-[8rem] flex flex-col bg-gradient-to-br ${tint} backdrop-blur-xl`}
      style={{ border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="font-body text-[10px] font-semibold text-white/70 uppercase tracking-[0.15em]">{label}</span>
        {badge && (
          <span
            className="ml-auto font-body text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={badgeTone === 'hot'
              ? { background: 'linear-gradient(135deg, #EC4899, #F472B6)', color: 'white' }
              : { background: 'rgba(124,58,237,0.25)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(124,58,237,0.3)' }
            }
          >
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function EmptyBlock({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-start justify-center h-full py-2">
      <p className="font-heading font-semibold text-white text-sm">{title}</p>
      <p className="font-body text-white/45 text-[11px] mt-1 leading-snug" dangerouslySetInnerHTML={{ __html: sub }} />
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 font-body text-[11px] font-semibold px-3 py-1.5 rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
