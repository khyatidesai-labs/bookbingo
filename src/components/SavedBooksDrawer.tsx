import { useState } from 'react';
import { X, BookmarkX, Inbox, BookOpen, Check, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOK_BY_ID } from '../data/books';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'saved' | 'reading' | 'inbox' | 'readers';

export default function SavedBooksDrawer({ open, onClose }: Props) {
  const {
    savedBooks,
    toggleSaved,
    mode,
    inbox,
    unreadCount,
    respondToRec,
    reading,
    openBook,
    readers,
  } = useApp();
  const [tab, setTab] = useState<Tab>('saved');

  const readingBooks = reading.map((r) => BOOK_BY_ID[r.bookId]).filter(Boolean);

  const tabs: { id: Tab; label: string; count: number; badge?: boolean }[] = [
    { id: 'saved', label: 'Saved', count: savedBooks.length },
    { id: 'reading', label: 'Reading', count: readingBooks.length },
    { id: 'inbox', label: 'Inbox', count: unreadCount, badge: true },
    { id: 'readers', label: 'Readers', count: readers.length },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity backdrop-blur-sm ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(8,5,17,0.75)' }}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-80 z-50 transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #1A1030 0%, #0F0B1A 100%)',
          borderLeft: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '-8px 0 40px rgba(124,58,237,0.15)',
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}
        >
          <div>
            <h2 className="font-heading text-base font-bold text-white">
              My Reading List
            </h2>
            <p className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {savedBooks.length} saved &middot;{' '}
              {mode === 'supabase' ? 'synced to cloud' : 'stored locally'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
            aria-label="Close"
          >
            <X size={12} className="text-white/60" />
          </button>
        </div>

        <div
          className="px-4 pt-2 flex gap-0.5"
          style={{ borderBottom: '1px solid rgba(124,58,237,0.12)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-2 py-2 -mb-px font-body text-[11px] font-semibold border-b-2 transition-colors flex items-center gap-1"
              style={
                tab === t.id
                  ? { borderColor: '#A78BFA', color: '#fff' }
                  : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }
              }
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className="text-[9px] font-semibold px-1 py-0 rounded-full min-w-[14px] text-center"
                  style={
                    t.badge && tab !== t.id
                      ? { background: 'linear-gradient(135deg, #EC4899, #DB2777)', color: '#fff' }
                      : { background: 'rgba(124,58,237,0.2)', color: 'rgba(255,255,255,0.6)' }
                  }
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tab === 'saved' &&
            (savedBooks.length === 0 ? (
              <EmptyState
                icon={<BookmarkX size={20} style={{ color: 'rgba(167,139,250,0.6)' }} />}
                title="No saved books yet"
                sub="Tap the bookmark on any book to add it here."
              />
            ) : (
              <ul className="space-y-2">
                {savedBooks.map((book) => (
                  <li
                    key={book.id}
                    className="flex gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-200"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}
                    onClick={() => openBook(book.id)}
                  >
                    <div className="w-10 h-14 flex-none rounded-lg overflow-hidden" style={{ background: 'rgba(124,58,237,0.2)' }}>
                      <img src={book.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-white text-xs leading-tight line-clamp-2">
                        {book.title}
                      </p>
                      <p className="font-body text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {book.author}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSaved(book.id); }}
                      className="self-start transition-colors"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      aria-label="Remove"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'reading' &&
            (readingBooks.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={20} style={{ color: 'rgba(167,139,250,0.6)' }} />}
                title="Nothing in progress"
                sub='Open a book and tap "I&apos;m reading" to see it here.'
              />
            ) : (
              <ul className="space-y-2">
                {readingBooks.map((book) => (
                  <li
                    key={book.id}
                    className="flex gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-200"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}
                    onClick={() => openBook(book.id)}
                  >
                    <div className="w-10 h-14 flex-none rounded-lg overflow-hidden" style={{ background: 'rgba(124,58,237,0.2)' }}>
                      <img src={book.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-white text-xs leading-tight line-clamp-2">
                        {book.title}
                      </p>
                      <p className="font-body text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {book.author}
                      </p>
                      <p className="font-body text-[10px] font-semibold mt-0.5 text-primary-400">
                        Currently reading
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'inbox' &&
            (inbox.length === 0 ? (
              <EmptyState
                icon={<Inbox size={20} style={{ color: 'rgba(167,139,250,0.6)' }} />}
                title="No recommendations yet"
                sub="When a friend sends you a book, it'll show up here."
              />
            ) : (
              <ul className="space-y-2">
                {inbox.map((rec) => {
                  const book = BOOK_BY_ID[rec.bookId];
                  if (!book) return null;
                  return (
                    <li
                      key={rec.id}
                      className="p-2 rounded-xl"
                      style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}
                    >
                      <div className="flex gap-2.5">
                        <div
                          className="w-10 h-14 flex-none rounded-lg overflow-hidden cursor-pointer"
                          style={{ background: 'rgba(124,58,237,0.2)' }}
                          onClick={() => openBook(book.id)}
                        >
                          <img src={book.cover} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-primary-400">
                            {rec.fromName} sent
                          </p>
                          <p
                            className="font-heading font-semibold text-white text-xs leading-tight line-clamp-2 cursor-pointer"
                            onClick={() => openBook(book.id)}
                          >
                            {book.title}
                          </p>
                          {rec.note && (
                            <p className="font-body text-[11px] italic mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              &ldquo;{rec.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => respondToRec(rec.id, 'saved')}
                          className="flex-1 font-body text-[11px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 text-white transition-all"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                        >
                          <Check size={11} />
                          Save
                        </button>
                        <button
                          onClick={() => respondToRec(rec.id, 'dismissed')}
                          className="flex-1 font-body text-[11px] font-medium py-1.5 rounded-lg transition-colors"
                          style={{
                            border: '1px solid rgba(124,58,237,0.25)',
                            color: 'rgba(255,255,255,0.5)',
                            background: 'transparent',
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === 'readers' &&
            (readers.length === 0 ? (
              <EmptyState
                icon={<Users size={20} style={{ color: 'rgba(167,139,250,0.6)' }} />}
                title="No other readers yet"
                sub="Once friends sign in, they'll show up here."
              />
            ) : (
              <ul className="space-y-1.5">
                {readers.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}
                  >
                    <span
                      className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-none text-white"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                    >
                      {r.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-white text-xs truncate">
                        {r.name}
                      </p>
                      <p className="font-body text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {r.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </aside>
    </>
  );
}

function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="text-center py-12">
      <div
        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
      >
        {icon}
      </div>
      <p className="font-heading font-semibold text-white text-sm">{title}</p>
      <p
        className="font-body text-[11px] mt-1 px-4"
        style={{ color: 'rgba(255,255,255,0.35)' }}
        dangerouslySetInnerHTML={{ __html: sub }}
      />
    </div>
  );
}
