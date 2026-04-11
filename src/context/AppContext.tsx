import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  BingoCard,
  Book,
  BookRecommendation,
  CurrentlyReading,
  Mood,
  Profession,
  UserProfile,
} from '../types';
import { BOOKS, BOOK_BY_ID } from '../data/books';
import {
  deleteBingoCard,
  getProfile,
  getStorageMode,
  initAuth,
  listBingoCards,
  listInbox,
  listMyReading,
  listReaders,
  listReadersOfBook,
  markReading,
  onAuthChange,
  saveBingoCard,
  saveProfile,
  sendRecommendation,
  signInWithUsername,
  signOut,
  stopReading,
  subscribeToInbox,
  subscribeToReadersOfBook,
  updateRecommendationStatus,
  type DirectoryReader,
  type StorageMode,
} from '../lib/storage';
import {
  recommend,
  recommendWithOpenAI,
  isOpenAIEnabled,
  type ScoredBook,
} from '../lib/recommendations';
import { makeEmptyCard } from '../lib/bingo';
import { supabase } from '../lib/supabase';
import { getCurrentSession, signOut as customSignOut } from '../lib/customAuth';

interface AppState {
  /** True until initAuth has resolved and initial data has loaded. */
  ready: boolean;
  mode: StorageMode;
  profile: UserProfile | null;

  /** Transient UI state — kept here so any component can trigger modals. */
  openedBookId: string | null;
  dynamicBook: Book | null;
  openBook: (bookId: string) => void;
  closeBook: () => void;
  setDynamicBook: (book: Book | null) => void;
  savedDrawerOpen: boolean;
  openSavedDrawer: () => void;
  closeSavedDrawer: () => void;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  /** Filter state that drives the Trending / Recommendations section. */
  selectedProfession?: Profession;
  selectedMoods: Mood[];
  recommendations: ScoredBook[];

  /** Saved/read books and derived helpers. */
  savedBookIds: string[];
  savedBooks: Book[];
  isSaved: (bookId: string) => boolean;

  /** Bingo cards. One active card at a time in the UI. */
  bingoCards: BingoCard[];
  activeCardId: string | null;
  activeCard: BingoCard | null;

  /** Currently reading state (derived map + list). */
  reading: CurrentlyReading[];
  isReading: (bookId: string) => boolean;
  readersForOpened: CurrentlyReading[];

  /** Inbox of recommendations from other readers. */
  inbox: BookRecommendation[];
  unreadCount: number;

  /** Directory of other readers (for the recommend picker). */
  readers: DirectoryReader[];

  // ---- actions ----
  setProfession: (p: Profession | undefined) => void;
  toggleMood: (m: Mood) => void;
  clearFilters: () => void;
  toggleSaved: (bookId: string) => void;
  createNewCard: (title?: string) => Promise<BingoCard>;
  setActiveCard: (cardId: string) => void;
  deleteCard: (cardId: string) => void;
  assignBookToSquare: (cardId: string, squareIdx: number, bookId: string) => void;
  markSquare: (cardId: string, squareIdx: number, completed: boolean) => void;
  clearSquare: (cardId: string, squareIdx: number) => void;
  // auth
  signIn: (username: string, password: string, displayName?: string) => Promise<{ upgraded: boolean }>;
  signOut: () => Promise<void>;
  // reading state
  toggleReading: (bookId: string) => Promise<void>;
  // recommendations
  sendRec: (params: {
    toUserId?: string;
    toEmail?: string;
    bookId: string;
    note: string;
  }) => Promise<void>;
  respondToRec: (recId: string, action: 'saved' | 'dismissed') => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<StorageMode>(getStorageMode());
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<Profession | undefined>();
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [bingoCards, setBingoCards] = useState<BingoCard[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [openedBookId, setOpenedBookId] = useState<string | null>(null);
  const [dynamicBook, setDynamicBook] = useState<Book | null>(null);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reading, setReading] = useState<CurrentlyReading[]>([]);
  const [readersForOpened, setReadersForOpened] = useState<CurrentlyReading[]>([]);
  const [inbox, setInbox] = useState<BookRecommendation[]>([]);
  const [readers, setReaders] = useState<DirectoryReader[]>([]);

  const openBook = useCallback((bookId: string) => setOpenedBookId(bookId), []);
  const closeBook = useCallback(() => { setOpenedBookId(null); setDynamicBook(null); }, []);
  const openSavedDrawer = useCallback(() => setSavedDrawerOpen(true), []);
  const closeSavedDrawer = useCallback(() => setSavedDrawerOpen(false), []);
  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  // ---- init ---------------------------------------------------------------
  // Loads everything for a given auth identity. Re-used on sign-in/out so
  // switching accounts doesn't require a full page reload.
  const loadForUser = useCallback(async (userId: string, m: StorageMode) => {
    setMode(m);
    const [p, cards, myReading, myInbox, directory] = await Promise.all([
      getProfile(userId),
      listBingoCards(userId),
      listMyReading(userId),
      listInbox(userId),
      listReaders({ excludeUserId: userId, limit: 50 }),
    ]);
    setProfileState(p);
    setSelectedProfession(p.profession);
    setSelectedMoods(p.moods ?? []);
    setBingoCards(cards);
    setActiveCardId(cards[0]?.id ?? null);
    setReading(myReading);
    setInbox(myInbox);
    setReaders(directory);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Check for custom auth session first (no email verification)
      const customSession = getCurrentSession();
      if (customSession) {
        if (cancelled) return;
        await loadForUser(customSession.id, 'supabase');
        if (cancelled) return;
        setReady(true);
        return;
      }

      // Fall back to Supabase anon auth
      const { userId, mode: m } = await initAuth();
      if (cancelled) return;
      await loadForUser(userId, m);
      if (cancelled) return;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadForUser]);

  // Follow Supabase auth changes so signing in/out swaps everything over
  // without a reload. Also (re)subscribes the realtime inbox channel.
  useEffect(() => {
    const unsub = onAuthChange((uid) => {
      if (!uid) return;
      void loadForUser(uid, 'supabase');
    });
    return () => unsub();
  }, [loadForUser]);

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeToInbox(profile.id, (rec) => {
      setInbox((prev) => [rec, ...prev]);
    });
    return () => unsub();
  }, [profile]);

  // Fetch readers whenever a book detail modal is opened, and subscribe to
  // live changes so "+2 just started" ticks without a refresh.
  useEffect(() => {
    if (!openedBookId) {
      setReadersForOpened([]);
      return;
    }
    let cancelled = false;
    const fetchReaders = async () => {
      const readers = await listReadersOfBook(openedBookId);
      if (!cancelled) setReadersForOpened(readers);
    };
    void fetchReaders();
    const unsub = subscribeToReadersOfBook(openedBookId, fetchReaders);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [openedBookId]);

  // ---- persistence helpers ------------------------------------------------
  const persistProfile = useCallback((next: UserProfile) => {
    setProfileState(next);
    void saveProfile(next);
  }, []);

  const persistCard = useCallback((next: BingoCard) => {
    setBingoCards((prev) => {
      const without = prev.filter((c) => c.id !== next.id);
      return [next, ...without];
    });
    void saveBingoCard(next);
  }, []);

  // ---- filter actions -----------------------------------------------------
  const setProfession = useCallback(
    (p: Profession | undefined) => {
      setSelectedProfession(p);
      if (profile) persistProfile({ ...profile, profession: p });
    },
    [persistProfile, profile],
  );

  const toggleMood = useCallback(
    (m: Mood) => {
      setSelectedMoods((prev) => {
        const next = prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m];
        if (profile) persistProfile({ ...profile, moods: next });
        return next;
      });
    },
    [persistProfile, profile],
  );

  const clearFilters = useCallback(() => {
    setSelectedProfession(undefined);
    setSelectedMoods([]);
    if (profile) persistProfile({ ...profile, profession: undefined, moods: [] });
  }, [persistProfile, profile]);

  // ---- saved books --------------------------------------------------------
  const savedBookIds = profile?.savedBookIds ?? [];
  const savedBooks = useMemo(
    () => savedBookIds.map((id) => BOOK_BY_ID[id]).filter(Boolean),
    [savedBookIds],
  );
  const isSaved = useCallback(
    (bookId: string) => savedBookIds.includes(bookId),
    [savedBookIds],
  );
  const toggleSaved = useCallback(
    (bookId: string) => {
      if (!profile) return;
      const next = profile.savedBookIds.includes(bookId)
        ? profile.savedBookIds.filter((id) => id !== bookId)
        : [...profile.savedBookIds, bookId];
      persistProfile({ ...profile, savedBookIds: next });
    },
    [persistProfile, profile],
  );

  // ---- bingo cards --------------------------------------------------------
  const activeCard = useMemo(
    () => bingoCards.find((c) => c.id === activeCardId) ?? null,
    [bingoCards, activeCardId],
  );

  const createNewCard = useCallback(
    async (title?: string): Promise<BingoCard> => {
      if (!profile) throw new Error('Profile not ready');
      const card = makeEmptyCard({
        id: crypto.randomUUID(),
        userId: profile.id,
        title: title ?? `Reading Challenge · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        pool: BOOKS,
        seed: Date.now(),
      });
      persistCard(card);
      setActiveCardId(card.id);
      return card;
    },
    [persistCard, profile],
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      if (!profile) return;
      setBingoCards((prev) => prev.filter((c) => c.id !== cardId));
      setActiveCardId((prev) => {
        if (prev !== cardId) return prev;
        const remaining = bingoCards.filter((c) => c.id !== cardId);
        return remaining[0]?.id ?? null;
      });
      void deleteBingoCard(profile.id, cardId);
    },
    [bingoCards, profile],
  );

  const updateCardSquare = useCallback(
    (
      cardId: string,
      squareIdx: number,
      mutator: (current: BingoCard['squares'][number]) => BingoCard['squares'][number],
    ) => {
      setBingoCards((prev) => {
        const idx = prev.findIndex((c) => c.id === cardId);
        if (idx === -1) return prev;
        const card = prev[idx];
        const squares = card.squares.map((sq, i) => (i === squareIdx ? mutator(sq) : sq));
        const updated: BingoCard = {
          ...card,
          squares,
          updatedAt: new Date().toISOString(),
        };
        void saveBingoCard(updated);
        const next = [...prev];
        next[idx] = updated;
        return next;
      });
    },
    [],
  );

  const assignBookToSquare = useCallback(
    (cardId: string, squareIdx: number, bookId: string) => {
      updateCardSquare(cardId, squareIdx, (sq) => ({
        ...sq,
        bookId,
        completed: true,
      }));
      // Also save the book to the reading list for convenience.
      if (profile && !profile.savedBookIds.includes(bookId)) {
        persistProfile({
          ...profile,
          savedBookIds: [...profile.savedBookIds, bookId],
        });
      }
    },
    [persistProfile, profile, updateCardSquare],
  );

  const markSquare = useCallback(
    (cardId: string, squareIdx: number, completed: boolean) => {
      updateCardSquare(cardId, squareIdx, (sq) => ({ ...sq, completed }));
    },
    [updateCardSquare],
  );

  const clearSquare = useCallback(
    (cardId: string, squareIdx: number) => {
      updateCardSquare(cardId, squareIdx, (sq) => ({
        ...sq,
        bookId: undefined,
        completed: false,
      }));
    },
    [updateCardSquare],
  );

  // ---- derived recommendations -------------------------------------------
  //
  // Two-stage: show the rule-based result instantly so the UI is never
  // blank, then upgrade to the OpenAI-ranked list when it arrives. If no
  // API key is configured, recommendWithOpenAI just returns the rule-based
  // result, so this is safe either way.
  const ruleBased = useMemo(
    () =>
      recommend(
        { profession: selectedProfession, moods: selectedMoods },
        24,
      ),
    [selectedProfession, selectedMoods],
  );
  const [recommendations, setRecommendations] = useState<ScoredBook[]>(ruleBased);

  useEffect(() => {
    // Paint rule-based immediately on filter change.
    setRecommendations(ruleBased);
    if (!isOpenAIEnabled()) return;

    let cancelled = false;
    void (async () => {
      const enhanced = await recommendWithOpenAI(
        { profession: selectedProfession, moods: selectedMoods },
        24,
      );
      if (!cancelled) setRecommendations(enhanced);
    })();
    return () => {
      cancelled = true;
    };
  }, [ruleBased, selectedProfession, selectedMoods]);

  const setActiveCard = useCallback((cardId: string) => {
    setActiveCardId(cardId);
  }, []);

  // ---- auth ---------------------------------------------------------------
  const signIn = useCallback(
    async (username: string, password: string, displayName?: string) => {
      const result = await signInWithUsername(username, password, displayName);
      // Refresh profile so the UI flips from "guest" to signed-in immediately
      // — both for the optimistic profiles.update we just did AND so the
      // display name gets shown in the header without waiting for reload.
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user?.id;
        if (uid) await loadForUser(uid, 'supabase');
      }
      return result;
    },
    [loadForUser],
  );

  const doSignOut = useCallback(async () => {
    // Sign out from custom auth
    customSignOut();
    // Also sign out from Supabase
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    // After sign-out, bounce to a fresh anonymous session so the app keeps working.
    const { userId, mode: m } = await initAuth();
    await loadForUser(userId, m);
  }, [loadForUser]);

  // ---- currently reading --------------------------------------------------
  const isReading = useCallback(
    (bookId: string) => reading.some((r) => r.bookId === bookId),
    [reading],
  );

  const toggleReading = useCallback(
    async (bookId: string) => {
      if (isReading(bookId)) {
        setReading((prev) => prev.filter((r) => r.bookId !== bookId));
        await stopReading(bookId);
      } else {
        const optimistic: CurrentlyReading = {
          userId: profile?.id ?? 'local',
          bookId,
          status: 'reading',
          startedAt: new Date().toISOString(),
          userName: profile?.name,
        };
        setReading((prev) => [optimistic, ...prev]);
        await markReading(bookId);
        // Refresh the readers list for the modal so the user sees themselves.
        if (openedBookId === bookId) {
          setReadersForOpened(await listReadersOfBook(bookId));
        }
      }
    },
    [isReading, openedBookId, profile],
  );

  // ---- recommendations ----------------------------------------------------
  const sendRec = useCallback(
    async (params: {
      toUserId?: string;
      toEmail?: string;
      bookId: string;
      note: string;
    }) => {
      if (!profile) throw new Error('Not signed in');
      await sendRecommendation({
        toUserId: params.toUserId,
        toEmail: params.toEmail,
        bookId: params.bookId,
        note: params.note,
        fromName: profile.name,
      });
    },
    [profile],
  );

  const respondToRec = useCallback(
    async (recId: string, action: 'saved' | 'dismissed') => {
      // Optimistic: drop from inbox immediately.
      setInbox((prev) => prev.filter((r) => r.id !== recId));
      if (action === 'saved') {
        const rec = inbox.find((r) => r.id === recId);
        if (rec && profile && !profile.savedBookIds.includes(rec.bookId)) {
          persistProfile({
            ...profile,
            savedBookIds: [...profile.savedBookIds, rec.bookId],
          });
        }
      }
      await updateRecommendationStatus(recId, action);
    },
    [inbox, persistProfile, profile],
  );

  const unreadCount = useMemo(
    () => inbox.filter((r) => r.status === 'pending').length,
    [inbox],
  );

  const value: AppState = {
    ready,
    mode,
    profile,
    openedBookId,
    dynamicBook,
    openBook,
    closeBook,
    setDynamicBook,
    savedDrawerOpen,
    openSavedDrawer,
    closeSavedDrawer,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    selectedProfession,
    selectedMoods,
    recommendations,
    savedBookIds,
    savedBooks,
    isSaved,
    bingoCards,
    activeCardId,
    activeCard,
    reading,
    isReading,
    readersForOpened,
    inbox,
    unreadCount,
    readers,
    setProfession,
    toggleMood,
    clearFilters,
    toggleSaved,
    createNewCard,
    setActiveCard,
    deleteCard,
    assignBookToSquare,
    markSquare,
    clearSquare,
    signIn,
    signOut: doSignOut,
    toggleReading,
    sendRec,
    respondToRec,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
