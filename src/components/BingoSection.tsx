import { useMemo, useState } from 'react';
import { Check, Trophy, Plus, Sparkles, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHALLENGE_BY_ID } from '../data/bingoChallenges';
import { BOOK_BY_ID } from '../data/books';
import { bingoProgress, countBingos, getWinningCells } from '../lib/bingo';
import BookPickerModal from './BookPickerModal';
import type { BingoChallenge, Book } from '../types';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getMonthLabel(iso: string) {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

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

  // Group cards by month
  const cardsByMonth = useMemo(() => {
    const groups: { [key: string]: typeof bingoCards } = {};
    bingoCards.forEach((card) => {
      const date = new Date(card.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(card);
    });
    return groups;
  }, [bingoCards]);

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
    <section id="bingo" className="py-12 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-70 translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* Left column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-accent-500" />
              <span className="font-body text-accent-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                Monthly Reading Challenge
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-900 leading-tight mb-2">
              Book Bingo <span className="italic text-accent-500">Challenge</span>
            </h2>
            <p className="font-body text-primary-500 text-xs leading-relaxed mb-5 max-w-sm">
              A fresh 15-square card each month. Tap a square, pick a matching book, and complete as many rows or columns as you can.
            </p>

            {/* Active card month badge */}
            {activeCard && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 rounded-full px-3 py-1.5">
                  <Calendar size={11} className="text-primary-400" />
                  <span className="font-body text-[11px] font-semibold text-primary-700">
                    {getMonthLabel(activeCard.createdAt)}
                  </span>
                </div>
                <span className="font-body text-[10px] text-primary-400">Monthly card</span>
              </div>
            )}

            {/* Past cards by month */}
            {ready && bingoCards.length > 0 && (
              <div className="space-y-3 mb-5">
                {Object.entries(cardsByMonth)
                  .reverse()
                  .map(([month, cards]) => (
                    <div key={month}>
                      <p className="font-body text-[10px] font-semibold text-primary-400 uppercase tracking-wider mb-1.5">
                        {month}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cards.map((card) => {
                          const isActive = card.id === activeCardId;
                          return (
                            <button
                              key={card.id}
                              onClick={() => setActiveCard(card.id)}
                              className={`font-body text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                                isActive
                                  ? 'bg-primary-900 text-white border-primary-900 shadow-sm'
                                  : 'bg-white text-primary-500 border-primary-200 hover:border-primary-400 hover:text-primary-800'
                              }`}
                            >
                              {getMonthLabel(card.createdAt)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => void createNewCard()}
                className="font-body text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-accent-600/20 hover:shadow-accent-600/40"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #C2610A 100%)', color: 'white' }}
              >
                <Plus size={13} />
                New card
              </button>
              {activeCardId && bingoCards.length > 0 && (
                <button
                  onClick={() => deleteCard(activeCardId)}
                  className="font-body text-xs font-semibold bg-white hover:bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
            </div>

            {bingos > 0 && (
              <div className="flex items-center gap-3 bg-success-light border border-success-DEFAULT/25 rounded-2xl px-4 py-3 mb-5">
                <Trophy size={20} className="text-success-DEFAULT flex-none" />
                <div>
                  <p className="font-body font-semibold text-green-800 text-sm">
                    {bingos === 1 ? 'Bingo!' : `${bingos} Bingos!`}
                  </p>
                  <p className="font-body text-green-700/70 text-xs">
                    {bingos} line{bingos > 1 ? 's' : ''} complete. Keep reading!
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-body text-primary-500 text-xs">Monthly progress</span>
                <span className="font-body font-semibold text-primary-900 text-xs">
                  {progress.done}/15 squares
                </span>
              </div>
              <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.pct}%`,
                    background: 'linear-gradient(90deg, #F97316, #E8820C)',
                  }}
                />
              </div>
              <p className="font-body text-[10px] text-primary-400 mt-1.5">
                {progress.done === 15
                  ? 'Card complete! Start a new one.'
                  : `${15 - progress.done} left this month`}
              </p>
            </div>
          </div>

          {/* Right column: 3×5 grid */}
          <div className="lg:col-span-3">
            {ready && !activeCard ? (
              <div className="rounded-3xl p-10 shadow-2xl text-center" style={{ background: 'linear-gradient(135deg, #12100E 0%, #2A1A08 100%)' }}>
                <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-accent-400" />
                </div>
                <p className="font-heading text-white text-xl font-bold mb-2">
                  No card for this month
                </p>
                <p className="font-body text-white/50 text-sm mb-5">
                  Start your {MONTH_NAMES[new Date().getMonth()]} reading challenge.
                </p>
                <button
                  onClick={() => void createNewCard()}
                  className="font-body text-sm font-semibold text-white px-6 py-3 rounded-full transition-all inline-flex items-center gap-2 shadow-lg shadow-accent-700/40"
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #C2610A 100%)' }}
                >
                  <Plus size={15} />
                  Start {MONTH_NAMES[new Date().getMonth()]} challenge
                </button>
              </div>
            ) : (
              activeCard && (
                <div className="rounded-3xl p-5 md:p-7 shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #12100E 0%, #1E1208 50%, #2A1A08 100%)' }}>
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(249,115,22,0.8) 1px, transparent 0)',
                      backgroundSize: '28px 28px',
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent" />

                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4 relative">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #F97316, #C2610A)' }}
                      >
                        <Calendar size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="font-heading text-white font-bold text-sm leading-none">
                          {getMonthLabel(activeCard.createdAt)}
                        </p>
                        <p className="font-body text-white/40 text-[10px] mt-0.5">Monthly Bingo Card</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/8 rounded-full px-2.5 py-1">
                      <span className="font-body text-white/70 text-[11px] font-semibold">
                        {progress.done}
                      </span>
                      <span className="font-body text-white/30 text-[11px]">/15</span>
                    </div>
                  </div>

                  {/* 3×5 grid */}
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
                          className={`relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 ${
                            winner
                              ? 'bg-success-DEFAULT shadow-lg shadow-success-DEFAULT/30 scale-[1.04]'
                              : completed
                              ? 'scale-[1.02]'
                              : 'bg-white/8 hover:bg-white/15 active:scale-95'
                          }`}
                          style={completed && !winner ? {
                            background: 'linear-gradient(135deg, #F97316, #C2610A)',
                            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                          } : undefined}
                          title={
                            book
                              ? `${book.title} — ${challenge?.longLabel ?? challenge?.label}`
                              : challenge?.longLabel ?? challenge?.label
                          }
                        >
                          {book ? (
                            <>
                              <img
                                src={book.cover}
                                alt={book.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50" />
                              {completed && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center z-10">
                                  <Check size={8} className="text-white" strokeWidth={3} />
                                </div>
                              )}
                              <span className="relative z-10 font-body text-[8px] md:text-[9px] font-semibold text-white leading-tight line-clamp-3 px-1 text-center">
                                {book.title}
                              </span>
                            </>
                          ) : (
                            <>
                              {completed && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                                  <Check size={8} className="text-white" strokeWidth={3} />
                                </div>
                              )}
                              <span className="font-body text-[9px] md:text-[10px] font-semibold text-white leading-tight line-clamp-3 px-1.5 md:px-2">
                                {challenge?.label ?? '—'}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-center font-body text-white/30 text-[10px]">
                    Tap to pick a book · right-click to clear
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
