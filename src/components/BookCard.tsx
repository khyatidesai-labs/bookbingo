import { useState } from 'react';
import { BookmarkPlus, BookmarkCheck, Users } from 'lucide-react';
import type { Book } from '../types';
import { useApp } from '../context/AppContext';
import { getOptimizedImageProps } from '../lib/imageOptimization';

interface Props {
  book: Book;
  tag?: string;
  onClick?: () => void;
  readerCount?: number;
}

export default function BookCard({ book, tag, onClick, readerCount }: Props) {
  const { isSaved, toggleSaved } = useApp();
  const [imgOk, setImgOk] = useState(true);
  const saved = isSaved(book.id);
  const imgProps = getOptimizedImageProps(book.cover, 'card');

  return (
    <div className="flex-none w-36 group cursor-pointer" onClick={onClick}>
      <div className="relative">
        <div
          className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:-translate-y-1.5"
          style={{
            boxShadow: '0 4px 15px rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.15)',
          }}
        >
          {imgOk ? (
            <img
              {...imgProps}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              onError={() => setImgOk(false)}
              onLoad={(e) => {
                // OpenLibrary returns 1px placeholder for missing covers
                if ((e.currentTarget as HTMLImageElement).naturalHeight <= 1) {
                  setImgOk(false);
                }
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #7C3AED 100%)' }}
            >
              <span className="font-heading text-5xl font-bold text-white/70">
                {book.title[0]}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(15,11,26,0.9), transparent)' }} />

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), transparent)' }}
          />

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
            {tag && (
              <span
                className="font-body text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm line-clamp-1 text-white"
                style={{ background: 'rgba(124,58,237,0.7)', border: '1px solid rgba(167,139,250,0.3)' }}
              >
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
                  ? 'text-white'
                  : 'bg-white/15 text-white/80 hover:bg-white/25 opacity-0 group-hover:opacity-100'
              }`}
              style={saved ? { background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 2px 10px rgba(124,58,237,0.5)' } : undefined}
            >
              {saved ? <BookmarkCheck size={12} /> : <BookmarkPlus size={12} />}
            </button>
          </div>

          {readerCount !== undefined && readerCount > 0 && (
            <div
              className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full pl-1.5 pr-2 py-0.5"
              style={{ background: 'rgba(124,58,237,0.6)', border: '1px solid rgba(167,139,250,0.3)', backdropFilter: 'blur(8px)' }}
            >
              <Users size={9} className="text-white" />
              <span className="font-body text-[9px] font-semibold text-white">
                {readerCount}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 px-0.5">
          <p className="font-body text-[9px] text-primary-400 uppercase tracking-wider font-semibold mb-0.5 line-clamp-1">
            {book.genres[0] ?? 'Book'}
          </p>
          <h3 className="font-heading font-bold text-white text-xs leading-snug mb-0.5 line-clamp-2 min-h-[2rem]">
            {book.title}
          </h3>
          <p className="font-body text-[10px] text-white/40 line-clamp-1">
            {book.author} · {book.year}
          </p>
        </div>
      </div>
    </div>
  );
}
