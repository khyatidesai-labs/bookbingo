/**
 * Unified data layer. Callers get the same async API whether the app is
 * running against Supabase (fully wired) or an offline localStorage fallback.
 *
 * On init the layer tries to sign in anonymously with Supabase. If anonymous
 * sign-ins are disabled in the project, or env vars are missing, it falls
 * back transparently to a local user id + localStorage persistence. In that
 * mode, community-room writes become local-only no-ops since the schema
 * requires an auth.uid().
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type {
  BingoCard,
  BookRecommendation,
  CommunityMessage,
  CommunityRoom,
  CurrentlyReading,
  UserProfile,
} from '../types';

// ---------- mode ------------------------------------------------------------

export type StorageMode = 'supabase' | 'local';

let mode: StorageMode = isSupabaseConfigured ? 'supabase' : 'local';
let currentUserId: string | null = null;

export function getStorageMode(): StorageMode {
  return mode;
}

// Keep the module in sync with Supabase's auth state. Without this, a user
// who starts in local fallback (because anon sign-ins are disabled) and
// later signs in via magic link would stay in `mode = 'local'` — and every
// storage read would keep returning localStorage data.
if (isSupabaseConfigured && supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      mode = 'supabase';
      currentUserId = session.user.id;
    }
  });
}

// ---------- auth ------------------------------------------------------------

/**
 * Returns the user id to use for this session, signing in anonymously with
 * Supabase when possible. Falls back to a stable local id otherwise.
 */
export async function initAuth(): Promise<{ userId: string; mode: StorageMode }> {
  // Local fallback id — generated once and reused.
  const localId = (() => {
    const existing = localStorage.getItem('bookbingo.localUserId');
    if (existing) return existing;
    const fresh = `local-${crypto.randomUUID()}`;
    localStorage.setItem('bookbingo.localUserId', fresh);
    return fresh;
  })();

  if (!isSupabaseConfigured || !supabase) {
    mode = 'local';
    currentUserId = localId;
    return { userId: localId, mode };
  }

  // Already authenticated? (page reload with persisted session)
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) {
    currentUserId = sessionData.session.user.id;
    mode = 'supabase';
    return { userId: currentUserId, mode };
  }

  // Try anonymous sign in.
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.warn(
      '[bookbingo] Anonymous Supabase sign-in failed, using local fallback.',
      error,
    );
    mode = 'local';
    currentUserId = localId;
    return { userId: localId, mode };
  }

  currentUserId = data.user.id;
  mode = 'supabase';
  // Ensure a profile row exists so we can read saved_book_ids back.
  await supabase
    .from('profiles')
    .upsert(
      { id: currentUserId, name: 'Reader', moods: [], saved_book_ids: [] },
      { onConflict: 'id', ignoreDuplicates: true },
    );
  return { userId: currentUserId, mode };
}

// ---------- profile ---------------------------------------------------------

const PROFILE_KEY = (id: string) => `bookbingo.profile.${id}`;

function readLocalProfile(userId: string): UserProfile {
  const raw = localStorage.getItem(PROFILE_KEY(userId));
  if (raw) return JSON.parse(raw) as UserProfile;
  return { id: userId, name: 'Reader', moods: [], savedBookIds: [] };
}

function writeLocalProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY(profile.id), JSON.stringify(profile));
}

export async function getProfile(userId: string): Promise<UserProfile> {
  if (mode === 'local' || !supabase) {
    return { ...readLocalProfile(userId), isGuest: true };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  // Prefer the live auth session as the source of truth for email, since
  // it reflects the USER_UPDATED event before the profiles row has been
  // re-synced on the client.
  const { data: session } = await supabase.auth.getSession();
  const authUser = session.session?.user;
  const sessionEmail = authUser?.email ?? undefined;
  const isGuest = authUser?.is_anonymous === true || !sessionEmail;

  // Keep the profiles row in sync when we see a new email in the session
  // — this is what makes user search find freshly-upgraded users.
  if (authUser && sessionEmail && (!data || data.email !== sessionEmail)) {
    await supabase
      .from('profiles')
      .upsert(
        {
          id: authUser.id,
          email: sessionEmail,
          name: data?.name ?? authUser.user_metadata?.name ?? 'Reader',
          moods: data?.moods ?? [],
          saved_book_ids: data?.saved_book_ids ?? [],
        },
        { onConflict: 'id' },
      );
  }

  if (error || !data) {
    return {
      ...readLocalProfile(userId),
      email: sessionEmail ?? readLocalProfile(userId).email,
      isGuest,
    };
  }
  return {
    id: data.id,
    name: data.name ?? authUser?.user_metadata?.name ?? 'Reader',
    email: sessionEmail ?? data.email ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    profession: data.profession ?? undefined,
    moods: data.moods ?? [],
    savedBookIds: data.saved_book_ids ?? [],
    isGuest,
  };
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  writeLocalProfile(profile);
  if (mode === 'local' || !supabase) return;
  await supabase.from('profiles').upsert({
    id: profile.id,
    name: profile.name,
    email: profile.email ?? null,
    avatar_url: profile.avatarUrl ?? null,
    profession: profile.profession ?? null,
    moods: profile.moods,
    saved_book_ids: profile.savedBookIds,
  });
}

// ---------- auth: email sign-in & sign-out ---------------------------------
//
// Two-path flow, because Supabase treats "upgrade an anon user" and "start
// a brand new session" as different operations:
//
//   1. If the current session is an *anonymous* user, we call
//      `updateUser({ email })`. That sends a confirmation link and — when
//      the user clicks it — attaches the email to the SAME auth.uid, so
//      their saved books, bingo cards and reading progress survive.
//
//   2. Otherwise (no session, or already a real email user) we use
//      `signInWithOtp({ email })` which is Supabase's magic-link flow.
//
// Without this split, anon users who tried to "sign in" would end up as
// a brand new account and lose everything from their guest session.

export async function signInWithEmail(
  email: string,
  displayName?: string,
): Promise<{ upgraded: boolean }> {
  if (!supabase) throw new Error('Supabase not configured — cannot sign in.');
  const normalised = email.trim().toLowerCase();

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  const isAnon = user?.is_anonymous === true;

  if (user && isAnon) {
    // In-place upgrade — preserves uid & all existing rows that reference it.
    const { error } = await supabase.auth.updateUser({
      email: normalised,
      data: displayName ? { name: displayName } : undefined,
    });
    if (error) throw error;
    // Optimistically mirror into profiles so search/picker finds the user
    // even before the confirmation link lands.
    await supabase
      .from('profiles')
      .update({
        email: normalised,
        name: displayName ?? undefined,
      })
      .eq('id', user.id);
    return { upgraded: true };
  }

  // Cold sign-in: send a magic link that will create (or re-auth) the user.
  const { error } = await supabase.auth.signInWithOtp({
    email: normalised,
    options: {
      emailRedirectTo: window.location.origin,
      data: displayName ? { name: displayName } : undefined,
    },
  });
  if (error) throw error;
  return { upgraded: false };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
  // Drop local caches so a re-auth starts clean.
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith('bookbingo.profile.') || k.startsWith('bookbingo.cards.')) {
      localStorage.removeItem(k);
    }
  }
}

/** Subscribe to Supabase auth changes (sign in/out). Returns an unsubscribe. */
export function onAuthChange(cb: (userId: string | null, email: string | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.id ?? null, session?.user?.email ?? null);
  });
  return () => data.subscription.unsubscribe();
}

// ---------- bingo cards -----------------------------------------------------

const CARDS_KEY = (userId: string) => `bookbingo.cards.${userId}`;

function readLocalCards(userId: string): BingoCard[] {
  const raw = localStorage.getItem(CARDS_KEY(userId));
  return raw ? (JSON.parse(raw) as BingoCard[]) : [];
}

function writeLocalCards(userId: string, cards: BingoCard[]) {
  localStorage.setItem(CARDS_KEY(userId), JSON.stringify(cards));
}

export async function listBingoCards(userId: string): Promise<BingoCard[]> {
  if (mode === 'local' || !supabase) return readLocalCards(userId);
  const { data, error } = await supabase
    .from('bingo_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return readLocalCards(userId);
  return data.map(rowToBingoCard);
}

export async function saveBingoCard(card: BingoCard): Promise<void> {
  // Mirror to local so a refresh feels instant even if network lags.
  const local = readLocalCards(card.userId);
  const next = [card, ...local.filter((c) => c.id !== card.id)];
  writeLocalCards(card.userId, next);

  if (mode === 'local' || !supabase) return;
  const payload = {
    id: card.id,
    user_id: card.userId,
    title: card.title,
    challenge_ids: card.challengeIds,
    squares: card.squares,
    created_at: card.createdAt,
    updated_at: new Date().toISOString(),
  };
  await supabase.from('bingo_cards').upsert(payload);
}

export async function deleteBingoCard(userId: string, cardId: string): Promise<void> {
  const local = readLocalCards(userId).filter((c) => c.id !== cardId);
  writeLocalCards(userId, local);
  if (mode === 'local' || !supabase) return;
  await supabase.from('bingo_cards').delete().eq('id', cardId);
}

interface BingoCardRow {
  id: string;
  user_id: string;
  title: string;
  challenge_ids: string[];
  squares: BingoCard['squares'];
  created_at: string;
  updated_at: string;
}

function rowToBingoCard(row: BingoCardRow): BingoCard {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    challengeIds: row.challenge_ids,
    squares: row.squares,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------- community rooms -------------------------------------------------

const LOCAL_ROOMS_KEY = 'bookbingo.localRooms';

const DEFAULT_LOCAL_ROOMS: CommunityRoom[] = [
  {
    id: 'local-welcome',
    code: 'BINGO-WELCOME',
    name: 'Welcome Readers',
    topic: 'Say hi and share your last great read.',
    memberCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'local-devs',
    code: 'BINGO-DEVS',
    name: 'Dev Book Club',
    topic: 'Books for engineers — clean code, craft, systems.',
    memberCount: 1,
    createdAt: new Date().toISOString(),
  },
];

function readLocalRooms(): CommunityRoom[] {
  const raw = localStorage.getItem(LOCAL_ROOMS_KEY);
  if (raw) return JSON.parse(raw) as CommunityRoom[];
  localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(DEFAULT_LOCAL_ROOMS));
  return DEFAULT_LOCAL_ROOMS;
}

function writeLocalRooms(rooms: CommunityRoom[]) {
  localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
}

export async function listRooms(): Promise<CommunityRoom[]> {
  if (mode === 'local' || !supabase) return readLocalRooms();
  const { data, error } = await supabase
    .from('community_rooms')
    .select('id, code, name, topic, created_at, room_members(count)')
    .order('created_at', { ascending: false });
  if (error || !data) return readLocalRooms();
  return data.map((r: Record<string, unknown>) => {
    const members = r.room_members as { count: number }[] | undefined;
    return {
      id: r.id as string,
      code: r.code as string,
      name: r.name as string,
      topic: (r.topic as string) ?? '',
      memberCount: members?.[0]?.count ?? 0,
      createdAt: r.created_at as string,
    };
  });
}

export async function createRoom(params: {
  name: string;
  topic: string;
  displayName: string;
}): Promise<CommunityRoom> {
  const code = `BINGO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  if (mode === 'local' || !supabase || !currentUserId) {
    const room: CommunityRoom = {
      id: `local-${crypto.randomUUID()}`,
      code,
      name: params.name,
      topic: params.topic,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    writeLocalRooms([room, ...readLocalRooms()]);
    return room;
  }
  const { data, error } = await supabase
    .from('community_rooms')
    .insert({
      code,
      name: params.name,
      topic: params.topic,
      created_by: currentUserId,
    })
    .select('id, code, name, topic, created_at')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to create room');
  await supabase.from('room_members').upsert({
    room_id: data.id,
    user_id: currentUserId,
    display_name: params.displayName,
  });
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    topic: data.topic ?? '',
    memberCount: 1,
    createdAt: data.created_at,
  };
}

export async function joinRoom(
  code: string,
  displayName: string,
): Promise<CommunityRoom | null> {
  const normalised = code.trim().toUpperCase();
  if (mode === 'local' || !supabase || !currentUserId) {
    return readLocalRooms().find((r) => r.code === normalised) ?? null;
  }
  const { data, error } = await supabase
    .from('community_rooms')
    .select('id, code, name, topic, created_at')
    .eq('code', normalised)
    .maybeSingle();
  if (error || !data) return null;
  await supabase.from('room_members').upsert({
    room_id: data.id,
    user_id: currentUserId,
    display_name: displayName,
  });
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    topic: data.topic ?? '',
    memberCount: 0,
    createdAt: data.created_at,
  };
}

// ---------- messages --------------------------------------------------------

const LOCAL_MSGS_KEY = (roomId: string) => `bookbingo.messages.${roomId}`;

function readLocalMessages(roomId: string): CommunityMessage[] {
  const raw = localStorage.getItem(LOCAL_MSGS_KEY(roomId));
  return raw ? (JSON.parse(raw) as CommunityMessage[]) : [];
}

function writeLocalMessages(roomId: string, msgs: CommunityMessage[]) {
  localStorage.setItem(LOCAL_MSGS_KEY(roomId), JSON.stringify(msgs));
}

export async function listMessages(roomId: string): Promise<CommunityMessage[]> {
  if (mode === 'local' || !supabase) return readLocalMessages(roomId);
  const { data, error } = await supabase
    .from('room_messages')
    .select('id, room_id, author_name, content, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error || !data) return readLocalMessages(roomId);
  return data.map(
    (r): CommunityMessage => ({
      id: r.id,
      roomId: r.room_id,
      authorName: r.author_name,
      content: r.content,
      createdAt: r.created_at,
    }),
  );
}

export async function postMessage(params: {
  roomId: string;
  displayName: string;
  content: string;
}): Promise<CommunityMessage> {
  const local: CommunityMessage = {
    id: `local-${crypto.randomUUID()}`,
    roomId: params.roomId,
    authorName: params.displayName,
    content: params.content,
    createdAt: new Date().toISOString(),
  };

  if (mode === 'local' || !supabase || !currentUserId) {
    writeLocalMessages(params.roomId, [...readLocalMessages(params.roomId), local]);
    return local;
  }
  const { data, error } = await supabase
    .from('room_messages')
    .insert({
      room_id: params.roomId,
      author_id: currentUserId,
      author_name: params.displayName,
      content: params.content,
    })
    .select('id, room_id, author_name, content, created_at')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to post message');
  return {
    id: data.id,
    roomId: data.room_id,
    authorName: data.author_name,
    content: data.content,
    createdAt: data.created_at,
  };
}

// ---------- reader directory ------------------------------------------------
//
// Lists non-anonymous readers so the recommend form can show a clickable
// directory instead of forcing the user to type an email address.

export interface DirectoryReader {
  id: string;
  name: string;
  email: string;
}

export async function listReaders(options?: {
  excludeUserId?: string;
  limit?: number;
}): Promise<DirectoryReader[]> {
  // `profiles` has public-read RLS, so we can query even while the local
  // fallback is active (e.g. before sign-in). This lets the picker show
  // other readers immediately on page load.
  if (!supabase) return [];
  const limit = options?.limit ?? 50;
  let query = supabase
    .from('profiles')
    .select('id, name, email')
    .not('email', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (options?.excludeUserId) {
    query = query.neq('id', options.excludeUserId);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data
    .filter((r: Record<string, unknown>) => typeof r.email === 'string' && r.email)
    .map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: (r.name as string) ?? 'Reader',
      email: r.email as string,
    }));
}

// ---------- book recommendations --------------------------------------------
//
// User-to-user book suggestions. In local mode we keep them in localStorage
// under a single key so the UI still works offline; in Supabase mode they
// hit the `book_recommendations` table and realtime keeps the inbox fresh.

const LOCAL_RECS_KEY = (userId: string) => `bookbingo.recs.${userId}`;

function readLocalRecs(userId: string): BookRecommendation[] {
  const raw = localStorage.getItem(LOCAL_RECS_KEY(userId));
  return raw ? (JSON.parse(raw) as BookRecommendation[]) : [];
}

function writeLocalRecs(userId: string, recs: BookRecommendation[]) {
  localStorage.setItem(LOCAL_RECS_KEY(userId), JSON.stringify(recs));
}

export async function sendRecommendation(params: {
  toEmail?: string;
  toUserId?: string;
  bookId: string;
  note: string;
  fromName: string;
}): Promise<BookRecommendation> {
  if (mode === 'local' || !supabase || !currentUserId) {
    // Local fallback: echo it back into our own inbox so the sender
    // can see what would have been sent.
    const rec: BookRecommendation = {
      id: `local-${crypto.randomUUID()}`,
      fromUser: currentUserId ?? 'local',
      fromName: params.fromName,
      toUser: params.toUserId ?? params.toEmail ?? 'local',
      bookId: params.bookId,
      note: params.note,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const inbox = readLocalRecs(currentUserId ?? 'local');
    writeLocalRecs(currentUserId ?? 'local', [rec, ...inbox]);
    return rec;
  }

  // Resolve recipient: either by uuid or by looking up an email in profiles.
  let toUser = params.toUserId;
  if (!toUser && params.toEmail) {
    const { data: match } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', params.toEmail.trim().toLowerCase())
      .maybeSingle();
    if (!match) throw new Error(`No reader found with email ${params.toEmail}`);
    toUser = match.id;
  }
  if (!toUser) throw new Error('No recipient specified');

  const { data, error } = await supabase
    .from('book_recommendations')
    .insert({
      from_user: currentUserId,
      to_user: toUser,
      book_id: params.bookId,
      note: params.note,
      status: 'pending',
    })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to send recommendation');

  return rowToRec(data, params.fromName);
}

export async function listInbox(userId: string): Promise<BookRecommendation[]> {
  if (mode === 'local' || !supabase) return readLocalRecs(userId);
  const { data, error } = await supabase
    .from('book_recommendations')
    .select('id, from_user, to_user, book_id, note, status, created_at, profiles!book_recommendations_from_user_fkey(name)')
    .eq('to_user', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) =>
    rowToRec(r, (r.profiles as { name?: string } | undefined)?.name ?? 'A reader'),
  );
}

export async function listSent(userId: string): Promise<BookRecommendation[]> {
  if (mode === 'local' || !supabase) return [];
  const { data, error } = await supabase
    .from('book_recommendations')
    .select('*')
    .eq('from_user', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => rowToRec(r, 'You'));
}

export async function updateRecommendationStatus(
  id: string,
  status: 'saved' | 'dismissed',
): Promise<void> {
  if (mode === 'local' || !supabase || !currentUserId) {
    const inbox = readLocalRecs(currentUserId ?? 'local').map((r) =>
      r.id === id ? { ...r, status } : r,
    );
    writeLocalRecs(currentUserId ?? 'local', inbox);
    return;
  }
  await supabase.from('book_recommendations').update({ status }).eq('id', id);
}

/** Live pipeline for new recommendations in the current user's inbox. */
export function subscribeToInbox(
  userId: string,
  onNew: (r: BookRecommendation) => void,
): () => void {
  if (mode === 'local' || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`inbox-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'book_recommendations',
        filter: `to_user=eq.${userId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        onNew(rowToRec(payload.new, 'A reader'));
      },
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

function rowToRec(r: Record<string, unknown>, fromName: string): BookRecommendation {
  return {
    id: r.id as string,
    fromUser: (r.from_user ?? r.fromUser) as string,
    fromName,
    toUser: (r.to_user ?? r.toUser) as string,
    bookId: (r.book_id ?? r.bookId) as string,
    note: (r.note as string) ?? '',
    status: ((r.status as string) ?? 'pending') as BookRecommendation['status'],
    createdAt: (r.created_at ?? r.createdAt) as string,
  };
}

// ---------- currently reading ----------------------------------------------
//
// Two angles on the same table:
//   * markReading(bookId)       — "I'm reading this now"
//   * listReadersOfBook(bookId) — "who else is reading this?"
// Local mode stores per-user arrays in localStorage so the UI still lights up.

const LOCAL_READING_KEY = (userId: string) => `bookbingo.reading.${userId}`;

function readLocalReading(userId: string): CurrentlyReading[] {
  const raw = localStorage.getItem(LOCAL_READING_KEY(userId));
  return raw ? (JSON.parse(raw) as CurrentlyReading[]) : [];
}

function writeLocalReading(userId: string, list: CurrentlyReading[]) {
  localStorage.setItem(LOCAL_READING_KEY(userId), JSON.stringify(list));
}

export async function markReading(bookId: string): Promise<void> {
  if (!currentUserId) return;
  if (mode === 'local' || !supabase) {
    const list = readLocalReading(currentUserId);
    if (!list.find((r) => r.bookId === bookId)) {
      writeLocalReading(currentUserId, [
        {
          userId: currentUserId,
          bookId,
          status: 'reading',
          startedAt: new Date().toISOString(),
        },
        ...list,
      ]);
    }
    return;
  }
  await supabase.from('currently_reading').upsert({
    user_id: currentUserId,
    book_id: bookId,
    status: 'reading',
    started_at: new Date().toISOString(),
    finished_at: null,
  });
}

export async function stopReading(bookId: string): Promise<void> {
  if (!currentUserId) return;
  if (mode === 'local' || !supabase) {
    writeLocalReading(
      currentUserId,
      readLocalReading(currentUserId).filter((r) => r.bookId !== bookId),
    );
    return;
  }
  await supabase
    .from('currently_reading')
    .delete()
    .eq('user_id', currentUserId)
    .eq('book_id', bookId);
}

export async function listMyReading(userId: string): Promise<CurrentlyReading[]> {
  if (mode === 'local' || !supabase) return readLocalReading(userId);
  const { data } = await supabase
    .from('currently_reading')
    .select('user_id, book_id, status, started_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  return (data ?? []).map(rowToReading);
}

export async function listReadersOfBook(bookId: string): Promise<CurrentlyReading[]> {
  if (mode === 'local' || !supabase) {
    // In local mode we only know about ourselves.
    return currentUserId
      ? readLocalReading(currentUserId).filter((r) => r.bookId === bookId)
      : [];
  }
  const { data } = await supabase
    .from('currently_reading')
    .select('user_id, book_id, status, started_at, profiles!currently_reading_user_id_fkey(name)')
    .eq('book_id', bookId)
    .eq('status', 'reading')
    .order('started_at', { ascending: false })
    .limit(25);
  return (data ?? []).map((r: Record<string, unknown>) =>
    rowToReading(r, (r.profiles as { name?: string } | undefined)?.name),
  );
}

function rowToReading(r: Record<string, unknown>, userName?: string): CurrentlyReading {
  return {
    userId: (r.user_id ?? r.userId) as string,
    userName,
    bookId: (r.book_id ?? r.bookId) as string,
    status: ((r.status as string) ?? 'reading') as CurrentlyReading['status'],
    startedAt: (r.started_at ?? r.startedAt) as string,
  };
}

/** Subscribe to reader-count changes for a particular book. */
export function subscribeToReadersOfBook(
  bookId: string,
  onChange: () => void,
): () => void {
  if (mode === 'local' || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`readers-${bookId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'currently_reading',
        filter: `book_id=eq.${bookId}`,
      },
      () => onChange(),
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

/** Subscribe to realtime inserts on room_messages for a given room. */
export function subscribeToRoom(
  roomId: string,
  onMessage: (m: CommunityMessage) => void,
): () => void {
  if (mode === 'local' || !supabase) return () => {};
  const client = supabase; // capture non-null reference for the closure
  const channel = client
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        const r = payload.new;
        onMessage({
          id: r.id as string,
          roomId: r.room_id as string,
          authorName: r.author_name as string,
          content: r.content as string,
          createdAt: r.created_at as string,
        });
      },
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
