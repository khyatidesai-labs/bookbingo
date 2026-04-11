import { useState } from 'react';
import { BookmarkPlus, BookmarkCheck, Users } from 'lucide-react';
import type { Book } from '../types';
import { useApp } from '../context/AppContext';
import { getOptimizedImageProps } from '../lib/imageOptimization';

interface Props {
  book: Book;
  tag?: string;
  onClick?: () => void;
  /** Optional: number of readers currently reading this book. */
  readerCount?: number;
}

/**
 * Reusable book card tile. Modern compact design:
 *  - Tall cover with gradient overlay and floating tag pill
 *  - Save toggle in top-right with state color
 *  - Optional "X reading" chip surfaces the social signal
 *  - Clean text block underneath with tight typography
 */
export default function BookCard({ book, tag, onClick, readerCount }: Props) {
  const { isSaved, toggleSaved } = useApp();
  const [imgOk, setImgOk] = useState(true);
  const saved = isSaved(book.id);
  const imgProps = getOptimizedImageProps(book.cover, 'card');

  return (
    <div className="flex-none w-36 group cursor-pointer" onClick={onClick}>
      <div className="relative">
        {/* Cover */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-primary-100 shadow-md group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 ring-1 ring-primary-900/5">
          {imgOk ? (
            <img
              {...imgProps}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-200 to-accent-400">
              <span className="font-heading text-5xl font-bold text-accent-800">
                {book.title[0]}
              </span>
            </div>
          )}

          {/* Bottom gradient — holds the reader chip when present */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent" />

          {/* Top row: tag + save */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
            {tag && (
              <span className="font-body text-[10px] font-semibold bg-white/95 backdrop-blur-sm text-primary-800 px-2 py-0.5 rounded-full shadow-sm line-clamp-1">
                {tag}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaved(book.id);
              }}
              className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                saved
                  ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                  : 'bg-white/90 text-primary-700 hover:bg-white opacity-0 group-hover:opacity-100'
              }`}
              aria-label={saved ? 'Remove from reading list' : 'Save to reading list'}
            >
              {saved ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
            </button>
          </div>

          {/* Reader count chip — "social proof" overlay */}
          {readerCount !== undefined && readerCount > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full pl-1 pr-2 py-0.5">
              <Users size={9} className="text-white" />
              <span className="font-body text-[10px] font-semibold text-white">
                {readerCount} reading
              </span>
            </div>
          )}
        </div>

        {/* Text block */}
        <div className="pt-2 px-0.5">
          <p className="font-body text-[9px] text-accent-500 uppercase tracking-wider font-semibold mb-0.5 line-clamp-1">
            {book.genres[0] ?? 'Book'}
          </p>
          <h3 className="font-heading font-bold text-primary-900 text-xs leading-snug mb-0.5 line-clamp-2 min-h-[2rem]">
            {book.title}
          </h3>
          <p className="font-body text-[10px] text-primary-500 line-clamp-1">
            {book.author} · {book.year}
          </p>
        </div>
      </div>
    </div>
  );
}
