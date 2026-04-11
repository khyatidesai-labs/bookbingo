import { useState } from 'react';
import {
  X,
  BookmarkPlus,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Send,
  Users,
  Search,
} from 'lucide-react';
import type { Book } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  book: Book | null;
  onClose: () => void;
}

/**
 * Compact detail view for a single book. Three social affordances sit
 * side-by-side with the blurb:
 *
 *   1. Save / currently-reading toggles
 *   2. "Reading right now" chips — other logged-in users with this same book
 *      marked as reading. Click a chip to recommend them a book.
 *   3. Recommend form with a searchable directory of other readers, so you
 *      never have to type a stranger's email address.
 */
export default function BookDetailModal({ book, onClose }: Props) {
  const {
    isSaved,
    toggleSaved,
    isReading,
    toggleReading,
    readersForOpened,
    readers,
    sendRec,
    profile,
    openAuthModal,
  } = useApp();
  const [imgOk, setImgOk] = useState(true);
  const [recOpen, setRecOpen] = useState(false);
  const [recQuery, setRecQuery] = useState('');
  const [recSelected, setRecSelected] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [recEmailFallback, setRecEmailFallback] = useState('');
  const [recNote, setRecNote] = useState('');
  const [recStatus, setRecStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [recError, setRecError] = useState('');

  if (!book) return null;
  const saved = isSaved(book.id);
  const reading = isReading(book.id);
  const signedIn = Boolean(profile?.email);

  const filteredReaders = readers.filter((r) => {
    if (!recQuery) return true;
    const q = recQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  const handleRecSend = async () => {
    if (!signedIn) {
      openAuthModal();
      return;
    }
    try {
      setRecStatus('sending');
      setRecError('');
      if (recSelected) {
        await sendRec({ toUserId: recSelected.id, bookId: book.id, note: recNote });
      } else if (recEmailFallback.includes('@')) {
        await sendRec({
          toEmail: recEmailFallback.trim(),
          bookId: book.id,
          note: recNote,
        });
      } else {
        setRecError('Pick a reader or enter an email');
        setRecStatus('error');
        return;
      }
      setRecStatus('sent');
      setRecNote('');
      setRecEmailFallback('');
      setRecSelected(null);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : 'Could not send');
      setRecStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-primary-100 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Close"
        >
          <X size={12} className="text-primary-600" />
        </button>

        <div className="md:w-40 h-44 md:h-auto flex-none bg-primary-100">
          {imgOk ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={() => setImgOk(false)}
              onLoad={(e) => {
                if ((e.currentTarget as HTMLImageElement).naturalHeight <= 1) {
                  setImgOk(false);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-100 to-accent-300">
              <span className="font-heading text-5xl font-bold text-accent-700">
                {book.title[0]}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <p className="font-body text-[10px] text-accent-500 uppercase tracking-widest font-semibold mb-1">
            {book.genres.join(' · ')}
          </p>
          <h2 className="font-heading text-xl font-bold text-primary-900 leading-tight mb-0.5">
            {book.title}
          </h2>
          <p className="font-body text-primary-500 text-xs mb-3">
            by {book.author} · {book.year} · {book.pages} pages
          </p>
          <p className="font-body text-primary-700 text-xs leading-relaxed mb-4 line-clamp-4">
            {book.description}
          </p>

          {book.moods.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {book.moods.slice(0, 4).map((m) => (
                <span
                  key={m}
                  className="font-body text-[10px] font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full"
                >
                  {m.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Readers panel — "who else is reading this right now". */}
          <div className="mb-3 rounded-lg border border-primary-100 bg-primary-50/60 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={12} className="text-primary-500" />
              <span className="font-body text-[10px] font-semibold text-primary-700 uppercase tracking-wider">
                Reading right now
              </span>
              {readersForOpened.length > 0 && (
                <span className="ml-auto font-body text-[10px] text-primary-400">
                  {readersForOpened.length}{' '}
                  {readersForOpened.length === 1 ? 'reader' : 'readers'}
                </span>
              )}
            </div>
            {readersForOpened.length === 0 ? (
              <p className="font-body text-[11px] text-primary-500">
                Be the first to start this book.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {readersForOpened.slice(0, 12).map((r) => (
                  <span
                    key={r.userId}
                    className="font-body text-[10px] bg-white border border-primary-100 text-primary-700 pl-1 pr-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    <span className="w-4 h-4 rounded-full bg-accent-100 text-accent-700 font-semibold text-[9px] flex items-center justify-center">
                      {(r.userName ?? 'R').slice(0, 1).toUpperCase()}
                    </span>
                    {r.userName ?? 'Reader'}
                  </span>
                ))}
                {readersForOpened.length > 12 && (
                  <span className="font-body text-[10px] text-primary-500 self-center">
                    +{readersForOpened.length - 12} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => toggleSaved(book.id)}
              className={`font-body font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                saved
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-primary-900 hover:bg-primary-800 text-white'
              }`}
            >
              {saved ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => toggleReading(book.id)}
              className={`font-body font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 border ${
                reading
                  ? 'bg-accent-500 text-white border-accent-500 hover:bg-accent-600'
                  : 'bg-white text-primary-800 border-primary-200 hover:border-primary-400'
              }`}
            >
              {reading ? <CheckCircle2 size={13} /> : <BookOpen size={13} />}
              {reading ? 'Reading' : "I'm reading"}
            </button>
          </div>

          {/* Recommend a friend */}
          {!recOpen ? (
            <button
              onClick={() => setRecOpen(true)}
              className="w-full font-body font-semibold text-xs py-2 rounded-lg border border-primary-200 text-primary-700 hover:border-primary-400 flex items-center justify-center gap-1.5"
            >
              <Send size={12} />
              Recommend to a friend
            </button>
          ) : (
            <div className="rounded-lg border border-primary-200 p-3">
              <p className="font-body text-[10px] font-semibold text-primary-600 uppercase tracking-wider mb-1.5">
                Recommend to
              </p>

              {/* Selected pill */}
              {recSelected ? (
                <div className="flex items-center gap-1.5 mb-2 bg-accent-50 border border-accent-200 rounded-lg px-2 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-accent-500 text-white font-semibold text-[10px] flex items-center justify-center">
                    {recSelected.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="font-body text-xs text-primary-800 font-medium flex-1 truncate">
                    {recSelected.name}
                  </span>
                  <button
                    onClick={() => setRecSelected(null)}
                    className="text-primary-500 hover:text-rose-500"
                    aria-label="Clear"
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <Search
                      size={11}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400"
                    />
                    <input
                      type="text"
                      value={recQuery}
                      onChange={(e) => setRecQuery(e.target.value)}
                      placeholder={
                        readers.length > 0
                          ? 'Search readers…'
                          : 'No other readers yet — use email below'
                      }
                      className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-primary-200 focus:border-accent-500 outline-none text-xs"
                    />
                  </div>
                  {readers.length > 0 && (
                    <div className="max-h-28 overflow-y-auto mb-2 -mx-1 px-1">
                      {filteredReaders.length === 0 ? (
                        <p className="font-body text-[11px] text-primary-500 py-1">
                          No matches.
                        </p>
                      ) : (
                        <ul className="space-y-0.5">
                          {filteredReaders.slice(0, 20).map((r) => (
                            <li key={r.id}>
                              <button
                                onClick={() =>
                                  setRecSelected({ id: r.id, name: r.name })
                                }
                                className="w-full flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-primary-50 text-left"
                              >
                                <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 font-semibold text-[10px] flex items-center justify-center flex-none">
                                  {r.name.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="font-body text-xs text-primary-800 truncate flex-1">
                                  {r.name}
                                </span>
                                <span className="font-body text-[10px] text-primary-400 truncate max-w-[8rem]">
                                  {r.email}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <input
                    type="email"
                    value={recEmailFallback}
                    onChange={(e) => setRecEmailFallback(e.target.value)}
                    placeholder="…or enter an email"
                    className="w-full px-2.5 py-1.5 mb-2 rounded-lg border border-primary-200 focus:border-accent-500 outline-none text-xs"
                  />
                </>
              )}

              <textarea
                value={recNote}
                onChange={(e) => setRecNote(e.target.value)}
                placeholder="Short note (optional)"
                rows={2}
                className="w-full px-2.5 py-1.5 mb-2 rounded-lg border border-primary-200 focus:border-accent-500 outline-none text-xs resize-none"
              />
              {recStatus === 'sent' ? (
                <p className="font-body text-[11px] text-emerald-700 mb-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Sent! It's in their inbox.
                </p>
              ) : null}
              {recStatus === 'error' && recError ? (
                <p className="font-body text-[11px] text-rose-600 mb-2">{recError}</p>
              ) : null}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setRecOpen(false);
                    setRecStatus('idle');
                    setRecError('');
                    setRecSelected(null);
                    setRecQuery('');
                  }}
                  className="flex-1 font-body text-xs font-medium py-1.5 rounded-md text-primary-600 hover:bg-primary-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecSend}
                  disabled={recStatus === 'sending'}
                  className="flex-1 font-body text-xs font-semibold py-1.5 rounded-md bg-primary-900 text-white hover:bg-primary-800 disabled:opacity-60"
                >
                  {recStatus === 'sending' ? 'Sending…' : 'Send'}
                </button>
              </div>
              {!signedIn && (
                <p className="font-body text-[10px] text-primary-400 mt-1.5">
                  You'll need to sign in first so your friend knows who sent it.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
