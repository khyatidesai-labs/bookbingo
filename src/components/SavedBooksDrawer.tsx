import { useState } from 'react';
import { X, BookmarkX, Inbox, BookOpen, Check, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOK_BY_ID } from '../data/books';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'saved' | 'reading' | 'inbox' | 'readers';

/**
 * Right-hand drawer. Four tabs:
 *  - Saved: books the user bookmarked
 *  - Reading: books marked as currently reading
 *  - Inbox: recommendations from other readers
 *  - Readers: directory of other signed-in users, so you can *find* people
 *    to recommend books to without typing an email
 */
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
        className={`fixed inset-0 bg-primary-900/60 backdrop-blur-sm z-40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="px-4 py-3 border-b border-primary-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-primary-900">
              My Reading List
            </h2>
            <p className="font-body text-[10px] text-primary-500 mt-0.5">
              {savedBooks.length} saved ·{' '}
              {mode === 'supabase' ? 'synced to cloud' : 'stored locally'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={12} className="text-primary-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-2 border-b border-primary-100 flex gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2 py-2 -mb-px font-body text-[11px] font-semibold border-b-2 transition-colors flex items-center gap-1 ${
                tab === t.id
                  ? 'border-accent-500 text-primary-900'
                  : 'border-transparent text-primary-500 hover:text-primary-800'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={`text-[9px] font-semibold px-1 py-0 rounded-full min-w-[14px] text-center ${
                    t.badge && tab !== t.id
                      ? 'bg-rose-500 text-white'
                      : 'bg-primary-100 text-primary-600'
                  }`}
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
                icon={<BookmarkX size={20} className="text-primary-400" />}
                title="No saved books yet"
                sub="Tap the bookmark on any book to add it here."
              />
            ) : (
              <ul className="space-y-2">
                {savedBooks.map((book) => (
                  <li
                    key={book.id}
                    className="flex gap-2.5 p-2 rounded-lg border border-primary-100 hover:border-primary-200 transition-colors cursor-pointer"
                    onClick={() => openBook(book.id)}
                  >
                    <div className="w-10 h-14 flex-none rounded overflow-hidden bg-primary-100">
                      <img
                        src={book.cover}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-primary-900 text-xs leading-tight line-clamp-2">
                        {book.title}
                      </p>
                      <p className="font-body text-primary-500 text-[11px] mt-0.5 truncate">
                        {book.author}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(book.id);
                      }}
                      className="self-start text-primary-400 hover:text-rose-500 transition-colors"
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
                icon={<BookOpen size={20} className="text-primary-400" />}
                title="Nothing in progress"
                sub='Open a book and tap "I&apos;m reading" to see it here.'
              />
            ) : (
              <ul className="space-y-2">
                {readingBooks.map((book) => (
                  <li
                    key={book.id}
                    className="flex gap-2.5 p-2 rounded-lg border border-primary-100 hover:border-primary-200 transition-colors cursor-pointer"
                    onClick={() => openBook(book.id)}
                  >
                    <div className="w-10 h-14 flex-none rounded overflow-hidden bg-primary-100">
                      <img
                        src={book.cover}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-primary-900 text-xs leading-tight line-clamp-2">
                        {book.title}
                      </p>
                      <p className="font-body text-primary-500 text-[11px] mt-0.5 truncate">
                        {book.author}
                      </p>
                      <p className="font-body text-accent-600 text-[10px] font-semibold mt-0.5">
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
                icon={<Inbox size={20} className="text-primary-400" />}
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
                      className="p-2 rounded-lg border border-primary-100"
                    >
                      <div className="flex gap-2.5">
                        <div
                          className="w-10 h-14 flex-none rounded overflow-hidden bg-primary-100 cursor-pointer"
                          onClick={() => openBook(book.id)}
                        >
                          <img
                            src={book.cover}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-[10px] text-accent-600 font-semibold uppercase tracking-wider">
                            {rec.fromName} sent
                          </p>
                          <p
                            className="font-heading font-semibold text-primary-900 text-xs leading-tight line-clamp-2 cursor-pointer"
                            onClick={() => openBook(book.id)}
                          >
                            {book.title}
                          </p>
                          {rec.note && (
                            <p className="font-body text-primary-600 text-[11px] italic mt-0.5 line-clamp-2">
                              &ldquo;{rec.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => respondToRec(rec.id, 'saved')}
                          className="flex-1 font-body text-[11px] font-semibold py-1.5 rounded-md bg-primary-900 text-white hover:bg-primary-800 flex items-center justify-center gap-1"
                        >
                          <Check size={11} />
                          Save
                        </button>
                        <button
                          onClick={() => respondToRec(rec.id, 'dismissed')}
                          className="flex-1 font-body text-[11px] font-medium py-1.5 rounded-md border border-primary-200 text-primary-600 hover:bg-primary-50"
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
                icon={<Users size={20} className="text-primary-400" />}
                title="No other readers yet"
                sub="Once friends sign in, they'll show up here and you can send them books."
              />
            ) : (
              <ul className="space-y-1.5">
                {readers.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-primary-100 hover:border-primary-200 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 font-semibold text-xs flex items-center justify-center flex-none">
                      {r.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-primary-900 text-xs truncate">
                        {r.name}
                      </p>
                      <p className="font-body text-primary-500 text-[10px] truncate">
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
      <div className="w-12 h-12 rounded-full bg-primary-100 mx-auto mb-3 flex items-center justify-center">
        {icon}
      </div>
      <p className="font-heading font-semibold text-primary-700 text-sm">{title}</p>
      <p
        className="font-body text-primary-500 text-[11px] mt-1 px-4"
        dangerouslySetInnerHTML={{ __html: sub }}
      />
    </div>
  );
}
