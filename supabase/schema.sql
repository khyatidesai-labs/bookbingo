-- ============================================================
-- Book Bingo — Supabase schema
-- Paste this into Supabase → SQL Editor → New Query → Run.
-- Safe to re-run: uses "if not exists" and "drop policy if exists".
-- ============================================================

-- 1. Profiles (augments auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  profession text,
  moods text[] default '{}',
  saved_book_ids text[] default '{}',
  created_at timestamptz default now()
);
-- Backfill columns when re-running against an older schema.
alter table profiles add column if not exists email       text;
alter table profiles add column if not exists avatar_url  text;

-- 1a. Books catalogue (seeded by supabase/books_seed.sql).
create table if not exists books (
  id          text primary key,
  title       text not null,
  author      text not null,
  isbn        text,
  cover       text,
  description text,
  pages       int,
  year        int,
  genres      text[] default '{}',
  moods       text[] default '{}',
  professions text[] default '{}',
  tags        text[] default '{}',
  created_at  timestamptz default now()
);
create index if not exists books_professions_idx on books using gin (professions);
create index if not exists books_moods_idx       on books using gin (moods);
create index if not exists books_tags_idx        on books using gin (tags);

-- 1b. Book recommendations — user-to-user suggestions with an optional note.
create table if not exists book_recommendations (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid references auth.users(id) on delete cascade,
  to_user     uuid references auth.users(id) on delete cascade,
  book_id     text not null,
  note        text default '',
  status      text default 'pending',  -- pending | saved | dismissed
  created_at  timestamptz default now()
);
create index if not exists recs_to_user_idx   on book_recommendations(to_user, created_at desc);
create index if not exists recs_from_user_idx on book_recommendations(from_user, created_at desc);

-- 1c. Currently reading — powers the "readers of this book" panel and
-- drives the "connect with people reading the same book" feature.
create table if not exists currently_reading (
  user_id     uuid references auth.users(id) on delete cascade,
  book_id     text not null,
  status      text default 'reading',  -- reading | finished
  started_at  timestamptz default now(),
  finished_at timestamptz,
  primary key (user_id, book_id)
);
create index if not exists currently_reading_book_idx on currently_reading(book_id);

-- 2. Bingo cards
create table if not exists bingo_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  challenge_ids text[] not null,
  squares jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists bingo_cards_user_idx on bingo_cards(user_id);

-- 3. Community rooms
create table if not exists community_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  topic text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 4. Room membership
create table if not exists room_members (
  room_id uuid references community_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- 5. Room messages
create table if not exists room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references community_rooms(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists room_messages_room_idx on room_messages(room_id, created_at);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles              enable row level security;
alter table bingo_cards           enable row level security;
alter table community_rooms       enable row level security;
alter table room_members          enable row level security;
alter table room_messages         enable row level security;
alter table books                 enable row level security;
alter table book_recommendations  enable row level security;
alter table currently_reading     enable row level security;

-- Books: everyone can read, nobody can write (seed via SQL editor).
drop policy if exists "books readable" on books;
create policy "books readable" on books for select using (true);

-- Book recommendations: you can read anything sent to/from you, create as self.
drop policy if exists "recs readable"     on book_recommendations;
drop policy if exists "recs insert self"  on book_recommendations;
drop policy if exists "recs update to"    on book_recommendations;
drop policy if exists "recs delete own"   on book_recommendations;
create policy "recs readable"    on book_recommendations for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "recs insert self" on book_recommendations for insert with check (auth.uid() = from_user);
create policy "recs update to"   on book_recommendations for update using      (auth.uid() = to_user);
create policy "recs delete own"  on book_recommendations for delete using      (auth.uid() = from_user or auth.uid() = to_user);

-- Currently reading: public read (so "who else is reading this" works),
-- self-only writes so nobody can speak for another reader.
drop policy if exists "reading readable"    on currently_reading;
drop policy if exists "reading insert self" on currently_reading;
drop policy if exists "reading update self" on currently_reading;
drop policy if exists "reading delete self" on currently_reading;
create policy "reading readable"    on currently_reading for select using (true);
create policy "reading insert self" on currently_reading for insert with check (auth.uid() = user_id);
create policy "reading update self" on currently_reading for update using      (auth.uid() = user_id);
create policy "reading delete self" on currently_reading for delete using      (auth.uid() = user_id);

-- Profiles: public read, self-write
drop policy if exists "profiles readable"       on profiles;
drop policy if exists "profiles insert self"    on profiles;
drop policy if exists "profiles update self"    on profiles;
create policy "profiles readable"    on profiles for select using (true);
create policy "profiles insert self" on profiles for insert with check (auth.uid() = id);
create policy "profiles update self" on profiles for update using      (auth.uid() = id);

-- Bingo cards: CRUD own
drop policy if exists "cards select own" on bingo_cards;
drop policy if exists "cards insert own" on bingo_cards;
drop policy if exists "cards update own" on bingo_cards;
drop policy if exists "cards delete own" on bingo_cards;
create policy "cards select own" on bingo_cards for select using      (auth.uid() = user_id);
create policy "cards insert own" on bingo_cards for insert with check (auth.uid() = user_id);
create policy "cards update own" on bingo_cards for update using      (auth.uid() = user_id);
create policy "cards delete own" on bingo_cards for delete using      (auth.uid() = user_id);

-- Rooms: public read, any authed user can create
drop policy if exists "rooms readable"    on community_rooms;
drop policy if exists "rooms create auth" on community_rooms;
create policy "rooms readable"    on community_rooms for select using (true);
create policy "rooms create auth" on community_rooms for insert with check (auth.uid() is not null);

-- Members: public read, self join/leave
drop policy if exists "members readable"  on room_members;
drop policy if exists "members join self" on room_members;
drop policy if exists "members leave self" on room_members;
create policy "members readable"   on room_members for select using (true);
create policy "members join self"  on room_members for insert with check (auth.uid() = user_id);
create policy "members leave self" on room_members for delete using      (auth.uid() = user_id);

-- Messages: public read, authed post
drop policy if exists "messages readable" on room_messages;
drop policy if exists "messages post"     on room_messages;
create policy "messages readable" on room_messages for select using      (true);
create policy "messages post"     on room_messages for insert with check (auth.uid() is not null and auth.uid() = author_id);

-- ============================================================
-- Seed a few community rooms so the UI isn't empty on first load.
-- Safe to re-run: does nothing if the code already exists.
-- ============================================================
insert into community_rooms (code, name, topic)
values
  ('BINGO-WELCOME', 'Welcome Readers', 'Say hi and share your last great read.'),
  ('BINGO-DEVS',    'Dev Book Club',   'Books for engineers — clean code, craft, systems.'),
  ('BINGO-MOOD',    'Mood Match',      'Ask for a book that matches a mood you are in.')
on conflict (code) do nothing;

-- ============================================================
-- Realtime (optional but nice):
--  - room_messages → live chat
--  - book_recommendations → inbox pings
--  - currently_reading → "X people reading now" updates
-- Safe to run multiple times — Supabase deduplicates additions.
-- ============================================================
alter publication supabase_realtime add table room_messages;
alter publication supabase_realtime add table book_recommendations;
alter publication supabase_realtime add table currently_reading;

-- ============================================================
-- NEXT STEP: run `supabase/books_seed.sql` in the SQL editor to
-- populate the books table with 500+ titles. Generated by
-- `scripts/generate-books.mjs` at the project root.
-- ============================================================
