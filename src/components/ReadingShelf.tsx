import { BookOpen, Inbox, Users, Send, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOK_BY_ID } from '../data/books';

/**
 * "Your Shelf" — the social dashboard strip. This is where today's new
 * features (currently-reading, recommendation inbox, reader directory)
 * become visible at a glance instead of being buried in a drawer.
 *
 * Three cards side-by-side:
 *  1. Now Reading — the book the user most recently marked as reading
 *  2. Inbox — latest incoming recommendations with sender + count
 *  3. Readers — directory of other signed-in users with avatar chips
 *
 * When empty, each card pivots to a gentle onboarding prompt that points
 * the user at the action that fills it.
 */
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
  const topRec = inbox[0];
  const topRecBook = topRec ? BOOK_BY_ID[topRec.bookId] : null;

  return (
    <section id="shelf" className="py-8 bg-gradient-to-b from-primary-900 to-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-body text-accent-300 text-[11px] font-semibold uppercase tracking-[0.2em]">
              Your Shelf
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-white mt-0.5">
              {signedIn ? `Welcome back, ${profile?.name?.split(' ')[0] ?? 'reader'}` : 'Start your reading circle'}
            </h2>
          </div>
          {!signedIn && (
            <button
              onClick={openAuthModal}
              className="hidden sm:flex font-body text-xs font-semibold px-4 py-2 bg-white text-primary-900 rounded-full hover:bg-primary-50 transition-colors items-center gap-1.5"
            >
              Sign in
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* --- Card 1: Now Reading ----------------------------------- */}
          <ShelfCard
            tint="bg-gradient-to-br from-emerald-500/30 to-emerald-600/25 border-emerald-400/60"
            icon={<BookOpen size={14} className="text-emerald-300" />}
            label="Now reading"
            badge={reading.length > 0 ? `${reading.length}` : undefined}
          >
            {currentBook ? (
              <button
                onClick={() => openBook(currentBook.id)}
                className="w-full flex gap-3 text-left group"
              >
                <div className="w-14 h-20 rounded-md overflow-hidden bg-white/10 flex-none ring-1 ring-white/10 shadow-lg group-hover:scale-[1.03] transition-transform">
                  <img
                    src={currentBook.cover}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-white text-sm leading-tight line-clamp-2">
                    {currentBook.title}
                  </p>
                  <p className="font-body text-white/60 text-[11px] mt-0.5 truncate">
                    {currentBook.author}
                  </p>
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-emerald-400 rounded-full" />
                  </div>
                  <p className="font-body text-[10px] text-white/50 mt-1.5">
                    In progress · tap to open
                  </p>
                </div>
              </button>
            ) : (
              <EmptyBlock
                title="Nothing in progress"
                sub="Open any book and tap &ldquo;I'm reading&rdquo; to track it here."
              />
            )}
          </ShelfCard>

          {/* --- Card 2: Inbox ------------------------------------------ */}
          <ShelfCard
            tint="bg-gradient-to-br from-rose-500/30 to-rose-600/25 border-rose-400/60"
            icon={<Inbox size={14} className="text-rose-300" />}
            label="From friends"
            badge={unreadCount > 0 ? `${unreadCount} new` : undefined}
            badgeTone={unreadCount > 0 ? 'hot' : undefined}
          >
            {topRec && topRecBook ? (
              <div className="space-y-2">
                <button
                  onClick={() => openBook(topRecBook.id)}
                  className="w-full flex gap-3 text-left group"
                >
                  <div className="w-14 h-20 rounded-md overflow-hidden bg-white/10 flex-none ring-1 ring-white/10 shadow-lg group-hover:scale-[1.03] transition-transform">
                    <img
                      src={topRecBook.cover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[10px] text-rose-300 font-semibold uppercase tracking-wider">
                      {topRec.fromName} sent
                    </p>
                    <p className="font-heading font-bold text-white text-sm leading-tight line-clamp-2 mt-0.5">
                      {topRecBook.title}
                    </p>
                    {topRec.note && (
                      <p className="font-body text-white/60 text-[11px] italic mt-1 line-clamp-2">
                        &ldquo;{topRec.note}&rdquo;
                      </p>
                    )}
                  </div>
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => respondToRec(topRec.id, 'saved')}
                    className="flex-1 font-body text-[11px] font-semibold py-1.5 rounded-md bg-white text-primary-900 hover:bg-primary-50"
                  >
                    Save to list
                  </button>
                  <button
                    onClick={openSavedDrawer}
                    className="font-body text-[11px] font-medium py-1.5 px-2.5 rounded-md border border-white/15 text-white/70 hover:bg-white/5"
                  >
                    View all
                  </button>
                </div>
              </div>
            ) : (
              <EmptyBlock
                title={signedIn ? 'No recs yet' : 'Sign in to receive recs'}
                sub={
                  signedIn
                    ? 'When a friend sends you a book, it shows up here.'
                    : 'One tap to upgrade your guest session.'
                }
                action={
                  signedIn
                    ? undefined
                    : { label: 'Sign in', onClick: openAuthModal }
                }
              />
            )}
          </ShelfCard>

          {/* --- Card 3: Readers ---------------------------------------- */}
          <ShelfCard
            tint="bg-gradient-to-br from-accent-500/30 to-accent-600/25 border-accent-400/60"
            icon={<Users size={14} className="text-accent-300" />}
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
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-primary-900/60 shadow-md"
                    >
                      {r.name.slice(0, 1).toUpperCase()}
                    </span>
                  ))}
                  {readers.length > 8 && (
                    <span className="w-8 h-8 rounded-full bg-white/10 text-white/70 text-[10px] font-semibold flex items-center justify-center ring-2 ring-primary-900/60">
                      +{readers.length - 8}
                    </span>
                  )}
                </div>
                <p className="font-body text-[11px] text-white/60 leading-snug">
                  Tap a book to see who's reading it, or open any title to
                  send a recommendation.
                </p>
                <button
                  onClick={openSavedDrawer}
                  className="mt-3 w-full font-body text-[11px] font-semibold py-1.5 rounded-md bg-white/10 border border-white/15 text-white hover:bg-white/15 flex items-center justify-center gap-1.5"
                >
                  <Send size={11} />
                  Browse readers
                </button>
              </div>
            ) : (
              <EmptyBlock
                title="No other readers yet"
                sub="Once friends sign in they'll appear here — you can pick them from the recommend menu."
              />
            )}
          </ShelfCard>
        </div>
      </div>
    </section>
  );
}

// ---------- subcomponents --------------------------------------------------

function ShelfCard({
  tint,
  icon,
  label,
  badge,
  badgeTone,
  children,
}: {
  tint: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeTone?: 'hot';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border ${tint} backdrop-blur-xl p-3 min-h-[8rem] flex flex-col`}
    >
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="font-body text-[10px] font-semibold text-white uppercase tracking-[0.15em]">
          {label}
        </span>
        {badge && (
          <span
            className={`ml-auto font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              badgeTone === 'hot'
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 text-white/80'
            }`}
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
      <p
        className="font-body text-white/55 text-[11px] mt-1 leading-snug"
        dangerouslySetInnerHTML={{ __html: sub }}
      />
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 font-body text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white text-primary-900 hover:bg-primary-50"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
