import { useEffect, useState } from 'react';
import {
  Users,
  MessageCircle,
  X,
  Plus,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import {
  createRoom,
  joinRoom,
  listMessages,
  listRooms,
  postMessage,
  subscribeToRoom,
} from '../lib/storage';
import { useApp } from '../context/AppContext';
import type { CommunityMessage, CommunityRoom } from '../types';

function CreateOrJoinModal({
  type,
  onClose,
  onCreated,
  onJoined,
  displayName,
}: {
  type: 'create' | 'join';
  onClose: () => void;
  onCreated: (room: CommunityRoom) => void;
  onJoined: (room: CommunityRoom) => void;
  displayName: string;
}) {
  const [value, setValue] = useState('');
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      if (type === 'create') {
        const room = await createRoom({ name: value.trim(), topic: topic.trim(), displayName });
        onCreated(room);
      } else {
        const room = await joinRoom(value.trim(), displayName);
        if (!room) {
          setError('No room with that code. Double-check and try again.');
          setBusy(false);
          return;
        }
        onJoined(room);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-primary-600" />
        </button>

        <div className="mb-6">
          <h3 className="font-heading text-2xl font-bold text-primary-900 mb-1">
            {type === 'create' ? 'Create a Room' : 'Join a Room'}
          </h3>
          <p className="font-body text-primary-500 text-sm">
            {type === 'create'
              ? 'Name your room — a join code will be generated for your friends.'
              : 'Enter the room code shared by your friend.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2 block">
              {type === 'create' ? 'Room name' : 'Room code'}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                type === 'create' ? 'e.g. Summer Readers 2026' : 'e.g. BINGO-4X9K'
              }
              className="w-full border border-primary-200 rounded-xl px-4 py-3 font-body text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
            />
          </div>

          {type === 'create' && (
            <div>
              <label className="font-body text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2 block">
                Topic (optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What will you read together?"
                className="w-full border border-primary-200 rounded-xl px-4 py-3 font-body text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
              />
            </div>
          )}

          {error && (
            <p className="font-body text-xs text-error-DEFAULT bg-error-light px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            disabled={busy || !value.trim()}
            onClick={submit}
            className="w-full font-body font-semibold text-sm bg-primary-900 hover:bg-primary-800 disabled:bg-primary-300 text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : type === 'create' ? (
              <>
                <Plus size={16} />
                Create room
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Join room
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomDetailDrawer({
  room,
  onClose,
  displayName,
}: {
  room: CommunityRoom | null;
  onClose: () => void;
  displayName: string;
}) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!room) return;
    let cancelled = false;
    setLoading(true);
    listMessages(room.id).then((msgs) => {
      if (!cancelled) {
        setMessages(msgs);
        setLoading(false);
      }
    });
    const unsub = subscribeToRoom(room.id, (m) => {
      setMessages((prev) => (prev.find((x) => x.id === m.id) ? prev : [...prev, m]));
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [room]);

  const send = async () => {
    if (!room || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await postMessage({
        roomId: room.id,
        displayName,
        content: draft.trim(),
      });
      setMessages((prev) => (prev.find((x) => x.id === msg.id) ? prev : [...prev, msg]));
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-primary-900/60 backdrop-blur-sm z-40 transition-opacity ${
          room ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[28rem] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          room ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {room && (
          <>
            <div className="px-6 py-5 border-b border-primary-100 flex items-start justify-between">
              <div className="min-w-0">
                <p className="font-body text-xs text-accent-500 uppercase tracking-widest font-semibold mb-1">
                  {room.code}
                </p>
                <h2 className="font-heading text-xl font-bold text-primary-900 truncate">
                  {room.name}
                </h2>
                {room.topic && (
                  <p className="font-body text-primary-500 text-xs mt-1 line-clamp-2">
                    {room.topic}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors flex-none"
              >
                <X size={14} className="text-primary-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-primary-50/40">
              {loading ? (
                <p className="font-body text-primary-500 text-sm text-center">Loading…</p>
              ) : messages.length === 0 ? (
                <p className="font-body text-primary-500 text-sm text-center py-8">
                  No messages yet. Say hi and share what you're reading.
                </p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="bg-white rounded-xl p-3 border border-primary-100">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="font-heading font-semibold text-primary-900 text-sm truncate">
                        {m.authorName}
                      </span>
                      <span className="font-body text-[10px] text-primary-400 flex-none">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-body text-primary-700 text-sm whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="px-6 py-4 border-t border-primary-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share your thoughts…"
                className="flex-1 border border-primary-200 rounded-xl px-4 py-2.5 font-body text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="bg-accent-500 hover:bg-accent-600 disabled:bg-primary-300 text-white p-2.5 rounded-xl transition-colors"
                aria-label="Send"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </aside>
    </>
  );
}

export default function CommunitySection() {
  const { profile, mode } = useApp();
  const [modal, setModal] = useState<'create' | 'join' | null>(null);
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRoom, setOpenRoom] = useState<CommunityRoom | null>(null);

  const displayName = profile?.name ?? 'Reader';

  const refresh = async () => {
    setLoading(true);
    const r = await listRooms();
    setRooms(r);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleCreated = (room: CommunityRoom) => {
    setRooms((prev) => [room, ...prev]);
    setOpenRoom(room);
  };
  const handleJoined = (room: CommunityRoom) => {
    setOpenRoom(room);
    void refresh();
  };

  return (
    <>
      {modal && (
        <CreateOrJoinModal
          type={modal}
          onClose={() => setModal(null)}
          onCreated={handleCreated}
          onJoined={handleJoined}
          displayName={displayName}
        />
      )}
      <RoomDetailDrawer
        room={openRoom}
        onClose={() => setOpenRoom(null)}
        displayName={displayName}
      />

      <section id="community" className="py-10 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-700/50 rounded-full blur-3xl translate-y-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="font-body text-accent-300 text-[10px] font-semibold uppercase tracking-[0.2em]">
              The Club
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-1 mb-1.5">
              Bingo Card Club
            </h2>
            <p className="font-body text-white/60 max-w-lg mx-auto text-xs leading-relaxed">
              Create rooms, invite friends, and race to complete your Bingo.
            </p>
            <p className="font-body text-white/30 text-[10px] mt-1">
              {mode === 'supabase' ? 'Synced to Supabase' : 'Offline mode — stored locally'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))
            ) : rooms.length === 0 ? (
              <p className="font-body text-white/50 text-sm md:col-span-3 text-center">
                No rooms yet. Be the first to create one.
              </p>
            ) : (
              rooms.slice(0, 6).map((room) => (
                <button
                  key={room.id}
                  onClick={() => setOpenRoom(room)}
                  className="text-left bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                      <MessageCircle size={13} className="text-accent-300" />
                    </div>
                    <span className="font-body text-[9px] font-semibold text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                      {room.code}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-white text-sm line-clamp-1">
                    {room.name}
                  </h3>
                  <p className="font-body text-white/50 text-[11px] mt-0.5 line-clamp-1">
                    {room.topic || 'Drop in and say hi.'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users size={10} className="text-white/40" />
                    <span className="font-body text-white/40 text-[10px]">
                      {room.memberCount} member{room.memberCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-white mb-0.5">
                  Ready to read together?
                </h3>
                <p className="font-body text-white/50 text-xs max-w-sm">
                  Start a room for your friends, or jump into an existing one with a code.
                </p>
              </div>
              <div className="flex gap-2 flex-none">
                <button
                  onClick={() => setModal('create')}
                  className="font-body font-semibold text-xs px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-accent-500/30"
                >
                  <Plus size={13} />
                  Create Room
                </button>
                <button
                  onClick={() => setModal('join')}
                  className="font-body font-semibold text-xs px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={13} />
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
