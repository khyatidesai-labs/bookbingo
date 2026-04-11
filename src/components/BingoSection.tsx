import { useMemo, useState } from 'react';
import { Check, Trophy, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHALLENGE_BY_ID } from '../data/bingoChallenges';
import { BOOK_BY_ID } from '../data/books';
import { bingoProgress, countBingos, getWinningCells } from '../lib/bingo';
import BookPickerModal from './BookPickerModal';
import type { BingoChallenge, Book } from '../types';

/**
 * Real 5x5 Book Bingo card. Each square is a reading challenge. Clicking a
 * square opens a picker showing books from the catalogue that satisfy it —
 * picking one marks the square complete and adds the book to the reading list.
 */
export default function BingoSection() {
  const {
    ready,
    bingoCards,
    activeCard,
    activeCardId,
    setActiveCard,
    createNewCard,
    deleteCard,
    assignBookToSquare,
    clearSquare,
  } = useApp();

  const [pickerSquareIdx, setPickerSquareIdx] = useState<number | null>(null);
  const [pickerChallenge, setPickerChallenge] = useState<BingoChallenge | null>(null);

  const squares = activeCard?.squares ?? [];
  const winningCells = useMemo(() => getWinningCells(squares), [squares]);
  const bingos = useMemo(() => countBingos(squares), [squares]);
  const progress = useMemo(() => bingoProgress(squares), [squares]);

  const handleSquareClick = (idx: number) => {
    if (!activeCard) return;
    const sq = activeCard.squares[idx];
    const challenge = CHALLENGE_BY_ID[sq.challengeId];
    if (!challenge) return;
    setPickerSquareIdx(idx);
    setPickerChallenge(challenge);
  };

  const handlePick = (book: Book) => {
    if (!activeCardId || pickerSquareIdx === null) return;
    assignBookToSquare(activeCardId, pickerSquareIdx, book.id);
  };

  const handleClearSquare = (idx: number) => {
    if (!activeCardId) return;
    clearSquare(activeCardId, idx);
  };

  return (
    <section id="bingo" className="py-10 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-50 rounded-full blur-3xl opacity-80 translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
          {/* Left column: intro + card list + progress */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-accent-500" />
              <span className="font-body text-accent-500 text-[10px] font-semibold uppercase tracking-[0.2em]">
                Reading Challenge
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-900 leading-tight mb-3">
              Book Bingo <span className="italic text-accent-500">Challenge</span>
            </h2>
            <p className="font-body text-primary-500 text-xs leading-relaxed mb-4 max-w-md">
              Each square is a reading challenge. Tap a square, pick a matching book, and watch the card light up.
            </p>

            {/* Card management */}
            <div className="space-y-3 mb-6">
              {ready && bingoCards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {bingoCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setActiveCard(card.id)}
                      className={`font-body text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        card.id === activeCardId
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400'
                      }`}
                    >
                      {card.title}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => void createNewCard()}
                  className="font-body text-xs font-semibold bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  New card
                </button>
                {activeCardId && bingoCards.length > 0 && (
                  <button
                    onClick={() => deleteCard(activeCardId)}
                    className="font-body text-xs font-semibold bg-white hover:bg-error-light text-error-DEFAULT border border-error-DEFAULT/30 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            </div>

            {bingos > 0 && (
              <div className="flex items-center gap-3 bg-success-light border border-success-DEFAULT/30 rounded-2xl px-5 py-4 mb-6">
                <Trophy size={22} className="text-success-DEFAULT flex-none" />
                <div>
                  <p className="font-body font-semibold text-success-dark text-sm">
                    {bingos === 1 ? 'Bingo!' : `${bingos} Bingos!`}
                  </p>
                  <p className="font-body text-success-dark/70 text-xs">
                    You completed {bingos} line{bingos > 1 ? 's' : ''}. Keep going!
                  </p>
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-body text-primary-500 text-sm">Progress</span>
                <span className="font-body font-semibold text-primary-900 text-sm">
                  {progress.done}/25 read
                </span>
              </div>
              <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right column: the 5x5 grid */}
          <div className="lg:col-span-3">
            {ready && !activeCard ? (
              <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-10 shadow-2xl text-center">
                <p className="font-heading text-white text-xl font-bold mb-2">
                  No card yet
                </p>
                <p className="font-body text-white/60 text-sm mb-5">
                  Start your first Book Bingo card in one tap.
                </p>
                <button
                  onClick={() => void createNewCard()}
                  className="font-body text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-full transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={15} />
                  Create my first card
                </button>
              </div>
            ) : (
              activeCard && (
                <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-4 left-4 w-24 h-24 border border-white/30 rounded-full" />
                    <div className="absolute bottom-8 right-6 w-32 h-32 border border-white/20 rounded-full" />
                  </div>

                  <div className="flex items-center justify-between mb-5 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">B</span>
                      </div>
                      <span className="font-heading text-white font-bold text-lg">
                        {activeCard.title}
                      </span>
                    </div>
                    <span className="font-body text-white/50 text-xs">
                      {progress.done}/25
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 md:gap-2 relative">
                    {activeCard.squares.map((sq, idx) => {
                      const challenge = CHALLENGE_BY_ID[sq.challengeId];
                      const book = sq.bookId ? BOOK_BY_ID[sq.bookId] : undefined;
                      const completed = sq.completed;
                      const winner = winningCells.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSquareClick(idx)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleClearSquare(idx);
                          }}
                          className={`relative aspect-square rounded-xl p-1.5 md:p-2 flex flex-col items-center justify-center text-center transition-all duration-300 group ${
                            winner
                              ? 'bg-success-DEFAULT shadow-lg shadow-success-DEFAULT/30 scale-[1.03]'
                              : completed
                              ? 'bg-accent-500 shadow-md shadow-accent-500/30 scale-[1.02]'
                              : 'bg-white/10 hover:bg-white/20 active:scale-95'
                          }`}
                          title={
                            book
                              ? `${book.title} — ${challenge?.longLabel ?? challenge?.label}`
                              : challenge?.longLabel ?? challenge?.label
                          }
                        >
                          {completed && (
                            <div
                              className={`absolute top-1 right-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center ${
                                winner ? 'bg-white/30' : 'bg-white/20'
                              }`}
                            >
                              <Check size={9} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                          <span className="font-body text-[9px] md:text-[10px] font-semibold text-white leading-tight line-clamp-3">
                            {book?.title ?? challenge?.label ?? '—'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-5 text-center font-body text-white/40 text-[11px]">
                    Tap a square to pick a matching book · right-click to clear
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <BookPickerModal
        open={pickerSquareIdx !== null}
        challenge={pickerChallenge}
        currentBookId={
          pickerSquareIdx !== null && activeCard
            ? activeCard.squares[pickerSquareIdx]?.bookId
            : undefined
        }
        onClose={() => {
          setPickerSquareIdx(null);
          setPickerChallenge(null);
        }}
        onPick={handlePick}
      />
    </section>
  );
}
