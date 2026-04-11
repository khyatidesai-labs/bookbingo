import { BookOpen, Inbox, Users, Send, ArrowRight, ChevronLeft, ChevronRight, X, BookMarked } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { BOOK_BY_ID } from '../data/books';
import { listMyReading } from '../lib/storage';
import type { CurrentlyReading } from '../types';
import type { DirectoryReader } from '../lib/storage';

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
    toggleReading,
  } = useApp();

  const signedIn = Boolean(profile?.email);
  const firstReading = reading[0];

  // Fallback: if we have a reading entry but no book in the database, show a placeholder
  const hasReadingEntry = Boolean(firstReading && !BOOK_BY_ID[firstReading?.bookId ?? '']);

  const topRec = inbox[0];
  const topRecBook = topRec ? BOOK_BY_ID[topRec.bookId] : null;

  // State for scrolling through recommendations and reading books
  const [currentRecIndex, setCurrentRecIndex] = useState(0);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(0);

  // State for reader profile popup
  const [selectedReader, setSelectedReader] = useState<DirectoryReader | null>(null);
  const [readerBooks, setReaderBooks] = useState<CurrentlyReading[]>([]);
  const [loadingReaderBooks, setLoadingReaderBooks] = useState(false);

  const validRecs = inbox.filter((rec) => BOOK_BY_ID[rec.bookId]);
  const currentRec = validRecs[currentRecIndex];
  const currentRecBook = currentRec ? BOOK_BY_ID[currentRec.bookId] : null;

  // Get all reading entries with valid books
  const validReadingBooks = reading
    .map((r) => ({
      entry: r,
      book: BOOK_BY_ID[r.bookId] ?? (dynamicBook?.id === r.bookId ? dynamicBook : null),
    }))
    .filter(({ book }) => book);

  const currentReadingItem = validReadingBooks[currentReadingIndex];
  const currentReadingBook = currentReadingItem?.book ?? null;

  const handleReaderClick = useCallback(async (reader: DirectoryReader) => {
    setSelectedReader(reader);
    setReaderBooks([]);
    setLoadingReaderBooks(true);
    try {
      const books = await listMyReading(reader.id);
      setReaderBooks(books);
    } finally {
      setLoadingReaderBooks(false);
    }
  }, []);

  // Close reader popup on Escape
  useEffect(() => {
    if (!selectedReader) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedReader(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedReader]);

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
          {/* Now Reading */}
          <ShelfCard
            tint="from-emerald-600/20 to-emerald-500/10"
            borderColor="rgba(16,185,129,0.25)"
            icon={<BookOpen size={14} className="text-emerald-400" />}
            label="Now reading"
            badge={validReadingBooks.length > 0 ? `${validReadingBooks.length}` : undefined}
          >
            {validReadingBooks.length > 0 && currentReadingBook ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                    {currentReadingIndex + 1} of {validReadingBooks.length}
                  </span>
                  {validReadingBooks.length > 1 && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentReadingIndex((i) => (i - 1 + validReadingBooks.length) % validReadingBooks.length)}
                        className="p-1 rounded hover:bg-emerald-500/20 transition-colors"
                        aria-label="Previous book"
                      >
                        <ChevronLeft size={12} className="text-emerald-400" />
                      </button>
                      <button
                        onClick={() => setCurrentReadingIndex((i) => (i + 1) % validReadingBooks.length)}
                        className="p-1 rounded hover:bg-emerald-500/20 transition-colors"
                        aria-label="Next book"
                      >
                        <ChevronRight size={12} className="text-emerald-400" />
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => openBook(currentReadingBook.id)} className="w-full flex gap-3 text-left group">
                  <div
                    className="w-14 h-20 rounded-lg overflow-hidden flex-none shadow-lg group-hover:scale-[1.03] transition-transform"
                    style={{ border: '1px solid rgba(167,139,250,0.2)' }}
                  >
                    <img src={currentReadingBook.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-white text-sm leading-tight line-clamp-2">{currentReadingBook.title}</p>
                    <p className="font-body text-white/50 text-[11px] mt-0.5 truncate">{currentReadingBook.author}</p>
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full w-1/3 rounded-full" style={{ background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
                    </div>
                    <p className="font-body text-[10px] text-white/40 mt-1.5">In progress · tap to open</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    void toggleReading(currentReadingBook.id);
                    if (validReadingBooks.length > 1) {
                      setCurrentReadingIndex((i) => Math.min(i, validReadingBooks.length - 2));
                    }
                  }}
                  className="w-full font-body text-[11px] font-semibold py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  Finished reading
                </button>
              </div>
            ) : hasReadingEntry ? (
              <div className="flex flex-col items-start justify-center h-full py-2">
                <p className="font-heading font-semibold text-white text-sm">Book loading...</p>
                <p className="font-body text-white/45 text-[11px] mt-1 leading-snug">Syncing your reading status. Check back in a moment.</p>
              </div>
            ) : (
              <EmptyBlock title="Nothing in progress" sub="Open any book and tap &ldquo;I'm reading&rdquo; to track it here." />
            )}
          </ShelfCard>

          {/* From Friends */}
          <ShelfCard
            tint="from-pink-500/20 to-pink-400/10"
            borderColor="rgba(236,72,153,0.25)"
            icon={<Inbox size={14} className="text-pink-400" />}
            label="From friends"
            badge={unreadCount > 0 ? `${unreadCount} new` : undefined}
            badgeTone={unreadCount > 0 ? 'hot' : undefined}
          >
            {validRecs.length > 0 && currentRecBook ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-[9px] text-pink-400 font-semibold uppercase tracking-wider">
                    {currentRecIndex + 1} of {validRecs.length}
                  </span>
                  {validRecs.length > 1 && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentRecIndex((i) => (i - 1 + validRecs.length) % validRecs.length)}
                        className="p-1 rounded hover:bg-pink-500/20 transition-colors"
                        aria-label="Previous recommendation"
                      >
                        <ChevronLeft size={12} className="text-pink-400" />
                      </button>
                      <button
                        onClick={() => setCurrentRecIndex((i) => (i + 1) % validRecs.length)}
                        className="p-1 rounded hover:bg-pink-500/20 transition-colors"
                        aria-label="Next recommendation"
                      >
                        <ChevronRight size={12} className="text-pink-400" />
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => openBook(currentRecBook.id)} className="w-full flex gap-3 text-left group">
                  <div
                    className="w-14 h-20 rounded-lg overflow-hidden flex-none shadow-lg group-hover:scale-[1.03] transition-transform"
                    style={{ border: '1px solid rgba(167,139,250,0.2)' }}
                  >
                    <img src={currentRecBook.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[10px] text-pink-400 font-semibold uppercase tracking-wider">{currentRec.fromName} sent</p>
                    <p className="font-heading font-bold text-white text-sm leading-tight line-clamp-2 mt-0.5">{currentRecBook.title}</p>
                    {currentRec.note && (
                      <p className="font-body text-white/50 text-[11px] italic mt-1 line-clamp-2">&ldquo;{currentRec.note}&rdquo;</p>
                    )}
                  </div>
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      respondToRec(currentRec.id, 'saved');
                      if (validRecs.length > 1) setCurrentRecIndex((i) => (i + 1) % validRecs.length);
                    }}
                    className="flex-1 font-body text-[11px] font-semibold py-1.5 rounded-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      respondToRec(currentRec.id, 'dismissed');
                      if (validRecs.length > 1) setCurrentRecIndex((i) => (i + 1) % validRecs.length);
                    }}
                    className="flex-1 font-body text-[11px] font-semibold py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
                    style={{ border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    Pass
                  </button>
                </div>
              </div>
            ) : topRec && !topRecBook ? (
              <div className="flex flex-col items-start justify-center h-full py-2">
                <p className="font-heading font-semibold text-white text-sm">Recommendation loading...</p>
                <p className="font-body text-white/45 text-[11px] mt-1 leading-snug">From {topRec.fromName}. Syncing book details. Check back in a moment.</p>
              </div>
            ) : (
              <EmptyBlock
                title={signedIn ? 'No recs yet' : 'Sign in to receive recs'}
                sub={signedIn ? 'When a friend sends you a book, it shows up here.' : 'One tap to upgrade your guest session.'}
                action={signedIn ? undefined : { label: 'Sign in', onClick: openAuthModal }}
              />
            )}
          </ShelfCard>

          {/* Readers Online */}
          <ShelfCard
            tint="from-primary-600/20 to-primary-500/10"
            borderColor="rgba(124,58,237,0.3)"
            icon={<Users size={14} className="text-primary-400" />}
            label="Readers online"
            badge={readers.length > 0 ? `${readers.length}` : undefined}
          >
            {readers.length > 0 ? (
              <div className="relative">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {readers.slice(0, 8).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleReaderClick(r)}
                      title={`${r.name} — click to see what they're reading`}
                      className="w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-md transition-transform hover:scale-110 hover:ring-2 hover:ring-purple-400"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }}
                    >
                      {r.name.slice(0, 1).toUpperCase()}
                    </button>
                  ))}
                  {readers.length > 8 && (
                    <span className="w-8 h-8 rounded-full text-white/60 text-[10px] font-semibold flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                      +{readers.length - 8}
                    </span>
                  )}
                </div>

                {/* Reader profile popup */}
                {selectedReader && (
                  <div
                    className="absolute inset-x-0 top-0 rounded-xl p-3 z-10"
                    style={{ background: 'rgba(15,11,26,0.97)', border: '1px solid rgba(124,58,237,0.35)', backdropFilter: 'blur(12px)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-none"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}
                      >
                        {selectedReader.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-bold text-white text-xs truncate">{selectedReader.name}</p>
                        <p className="font-body text-white/40 text-[10px] truncate">{selectedReader.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedReader(null)}
                        className="text-white/40 hover:text-white transition-colors flex-none"
                        aria-label="Close"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <p className="font-body text-[9px] font-semibold text-primary-400 uppercase tracking-wider mb-1.5">
                      Currently reading
                    </p>

                    {loadingReaderBooks ? (
                      <p className="font-body text-[11px] text-white/40">Loading...</p>
                    ) : readerBooks.length === 0 ? (
                      <p className="font-body text-[11px] text-white/40">Nothing tracked yet.</p>
                    ) : (
                      <ul className="space-y-1.5 max-h-28 overflow-y-auto">
                        {readerBooks.map((rb) => {
                          const book = BOOK_BY_ID[rb.bookId];
                          if (!book) return null;
                          return (
                            <li key={rb.bookId}>
                              <button
                                onClick={() => { openBook(book.id); setSelectedReader(null); }}
                                className="w-full flex items-center gap-2 text-left hover:bg-primary-800/40 rounded-lg px-1 py-1 transition-colors"
                              >
                                <div className="w-6 h-9 rounded flex-none overflow-hidden" style={{ background: 'rgba(124,58,237,0.2)' }}>
                                  <img src={book.cover} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-heading font-semibold text-white text-[11px] leading-tight line-clamp-1">{book.title}</p>
                                  <p className="font-body text-white/40 text-[10px] truncate">{book.author}</p>
                                </div>
                                <BookMarked size={10} className="text-primary-400 flex-none ml-auto" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                <p className="font-body text-[11px] text-white/50 leading-snug mb-3">
                  Tap an avatar to see what they're reading.
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
