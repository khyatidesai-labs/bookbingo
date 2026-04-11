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
    <section
      id="bingo"
      className="py-14 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0B1A 0%, #1A1030 50%, #0F0B1A 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-5%] right-[-5%] w-[32rem] h-[32rem] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }}
        />
        <div
          className="absolute bottom-[-5%] left-[-5%] w-[28rem] h-[28rem] rounded-full opacity-[0.06] blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-primary-400" />
              <span className="font-body text-primary-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Monthly Reading Challenge
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
              Book Bingo <span className="italic text-gradient-purple">Challenge</span>
            </h2>
            <p className="font-body text-sm leading-relaxed mb-5 max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              A fresh 15-square card each month. Tap a square, pick a matching book, and complete as many rows or columns as you can.
            </p>

            {activeCard && (
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <Calendar size={11} className="text-primary-400" />
                  <span className="font-body text-[11px] font-semibold text-white/75">
                    {getMonthLabel(activeCard.createdAt)}
                  </span>
                </div>
                <span className="font-body text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Monthly card</span>
              </div>
            )}

            {ready && bingoCards.length > 0 && (
              <div className="space-y-3 mb-5">
                {Object.entries(cardsByMonth)
                  .reverse()
                  .map(([month, cards]) => (
                    <div key={month}>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {month}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cards.map((card) => {
                          const isActive = card.id === activeCardId;
                          return (
                            <button
                              key={card.id}
                              onClick={() => setActiveCard(card.id)}
                              className="font-body text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                              style={
                                isActive
                                  ? {
                                      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                                      color: '#fff',
                                      boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
                                      border: '1px solid transparent',
                                    }
                                  : {
                                      background: 'rgba(124,58,237,0.08)',
                                      color: 'rgba(255,255,255,0.5)',
                                      border: '1px solid rgba(124,58,237,0.2)',
                                    }
                              }
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
                className="font-body text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                }}
              >
                <Plus size={13} />
                New card
              </button>
              {activeCardId && bingoCards.length > 0 && (
                <button
                  onClick={() => deleteCard(activeCardId)}
                  className="font-body text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'rgba(252,165,165,0.9)',
                  }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
            </div>

            {bingos > 0 && (
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <Trophy size={20} className="text-emerald-400 flex-none" />
                <div>
                  <p className="font-body font-semibold text-emerald-300 text-sm">
                    {bingos === 1 ? 'Bingo!' : `${bingos} Bingos!`}
                  </p>
                  <p className="font-body text-emerald-400/60 text-xs">
                    {bingos} line{bingos > 1 ? 's' : ''} complete. Keep reading!
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Monthly progress</span>
                <span className="font-body font-semibold text-white text-xs">
                  {progress.done}/15 squares
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(124,58,237,0.15)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.pct}%`,
                    background: 'linear-gradient(90deg, #7C3AED, #C084FC)',
                    boxShadow: '0 0 8px rgba(124,58,237,0.6)',
                  }}
                />
              </div>
              <p className="font-body text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {progress.done === 15
                  ? 'Card complete! Start a new one.'
                  : `${15 - progress.done} left this month`}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {ready && !activeCard ? (
              <div
                className="rounded-3xl p-10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(29,16,56,0.9) 0%, rgba(45,27,105,0.6) 100%)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  boxShadow: '0 8px 40px rgba(124,58,237,0.15)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <Calendar size={24} className="text-primary-400" />
                </div>
                <p className="font-heading text-white text-xl font-bold mb-2">
                  No card for this month
                </p>
                <p className="font-body text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Start your {MONTH_NAMES[new Date().getMonth()]} reading challenge.
                </p>
                <button
                  onClick={() => void createNewCard()}
                  className="font-body text-sm font-semibold text-white px-6 py-3 rounded-full transition-all inline-flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                    boxShadow: '0 6px 20px rgba(124,58,237,0.45)',
                  }}
                >
                  <Plus size={15} />
                  Start {MONTH_NAMES[new Date().getMonth()]} challenge
                </button>
              </div>
            ) : (
              activeCard && (
                <div
                  className="rounded-3xl p-5 md:p-7 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,11,26,0.98) 0%, rgba(29,16,56,0.95) 50%, rgba(45,27,105,0.9) 100%)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    boxShadow: '0 16px 60px rgba(124,58,237,0.2)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(167,139,250,0.8) 1px, transparent 0)',
                      backgroundSize: '28px 28px',
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)' }}
                  />

                  <div className="flex items-center justify-between mb-5 relative">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                      >
                        <Calendar size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="font-heading text-white font-bold text-sm leading-none">
                          {getMonthLabel(activeCard.createdAt)}
                        </p>
                        <p className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Monthly Bingo Card</p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
                    >
                      <span className="font-body text-white/80 text-[11px] font-semibold">{progress.done}</span>
                      <span className="font-body text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/15</span>
                    </div>
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
                          className="relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 active:scale-95"
                          style={
                            winner
                              ? {
                                  background: 'linear-gradient(135deg, #10B981, #059669)',
                                  boxShadow: '0 4px 16px rgba(16,185,129,0.45)',
                                  transform: 'scale(1.04)',
                                }
                              : completed
                              ? {
                                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                                  boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
                                  transform: 'scale(1.02)',
                                }
                              : {
                                  background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(124,58,237,0.15)',
                                }
                          }
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
                                <div
                                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center z-10"
                                  style={{ background: 'rgba(255,255,255,0.25)' }}
                                >
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
                                <div
                                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: 'rgba(255,255,255,0.25)' }}
                                >
                                  <Check size={8} className="text-white" strokeWidth={3} />
                                </div>
                              )}
                              <span className="font-body text-[9px] md:text-[10px] font-semibold leading-tight line-clamp-3 px-1.5 md:px-2" style={{ color: completed ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                                {challenge?.label ?? '—'}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-center font-body text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
