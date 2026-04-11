import { useMemo, useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import type { Book, BingoChallenge } from '../types';
import { BOOKS } from '../data/books';
import { booksForChallenge } from '../lib/bingo';

interface Props {
  open: boolean;
  challenge: BingoChallenge | null;
  currentBookId?: string;
  onClose: () => void;
  onPick: (book: Book) => void;
}

/**
 * Modal shown when the user clicks an empty bingo square. Lists books from
 * the catalogue that satisfy the square's challenge, so they can only mark
 * a square with a book that actually fits.
 */
export default function BookPickerModal({
  open,
  challenge,
  currentBookId,
  onClose,
  onPick,
}: Props) {
  const [query, setQuery] = useState('');

  const books: Book[] = useMemo(() => {
    if (!challenge) return [];
    const matches = booksForChallenge(challenge, BOOKS);
    if (!query.trim()) return matches;
    const q = query.toLowerCase();
    return matches.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genres.join(' ').toLowerCase().includes(q),
    );
  }, [challenge, query]);

  if (!open || !challenge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={14} className="text-primary-600" />
        </button>

        <div className="p-6 md:p-8 border-b border-primary-100">
          <p className="font-body text-xs text-accent-500 uppercase tracking-widest font-semibold mb-2">
            Pick a book for
          </p>
          <h3 className="font-heading text-2xl font-bold text-primary-900 leading-tight">
            {challenge.longLabel ?? challenge.label}
          </h3>
          <p className="font-body text-primary-500 text-sm mt-1">
            {books.length} matching book{books.length === 1 ? '' : 's'} in the catalogue
          </p>

          <div className="mt-4 relative">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author"
              className="w-full pl-11 pr-4 py-3 border border-primary-200 rounded-xl font-body text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4">
          {books.length === 0 ? (
            <p className="font-body text-primary-500 text-sm text-center py-10">
              No books in the catalogue match this challenge yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {books.map((book) => {
                const picked = book.id === currentBookId;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      onPick(book);
                      onClose();
                    }}
                    className={`relative text-left p-3 rounded-xl border transition-all flex gap-3 ${
                      picked
                        ? 'bg-accent-50 border-accent-300'
                        : 'bg-white border-primary-200 hover:border-primary-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-12 h-16 flex-none rounded overflow-hidden bg-primary-100">
                      <img
                        src={book.cover}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-primary-900 text-sm leading-tight line-clamp-2">
                        {book.title}
                      </p>
                      <p className="font-body text-primary-500 text-xs mt-0.5 line-clamp-1">
                        {book.author}
                      </p>
                      <p className="font-body text-primary-400 text-xs mt-1">
                        {book.year} · {book.pages}p
                      </p>
                    </div>
                    {picked && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-500 text-white flex items-center justify-center">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
