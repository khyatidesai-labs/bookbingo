# Book Bingo — Setup & Step-by-Step Build Guide

A gamified book recommendation app. Pick your profession and mood, get tailored
recommendations, and complete a 5×5 bingo card of reading challenges with
friends in shared rooms.

**Stack:** Vite + React + TypeScript + Tailwind · Supabase (auth, Postgres,
Realtime) · Open Library covers · rule-based recommender (OpenAI hook-point
left in place).

---

## Phase 0 — What's already done in this repo

| Piece | Where | Status |
| --- | --- | --- |
| Bolt visual scaffold | `src/components/*` | ✅ inherited |
| Types & domain model | `src/types.ts` | ✅ |
| Seeded 30-book catalogue | `src/data/books.ts` | ✅ |
| Profession / mood metadata | `src/data/{professions,moods}.ts` | ✅ |
| 28-challenge bingo pool | `src/data/bingoChallenges.ts` | ✅ |
| 5×5 bingo logic & win detection | `src/lib/bingo.ts` | ✅ |
| Rule-based recommender (OpenAI-ready) | `src/lib/recommendations.ts` | ✅ |
| Supabase client | `src/lib/supabase.ts` | ✅ |
| Unified storage layer (Supabase ↔ localStorage) | `src/lib/storage.ts` | ✅ |
| Global state (`AppProvider`) | `src/context/AppContext.tsx` | ✅ |
| Book card / detail / picker / saved drawer | `src/components/Book*.tsx`, `SavedBooksDrawer.tsx` | ✅ |
| Functional profession + mood pickers | `src/components/{ProfessionCategories,MoodSection}.tsx` | ✅ |
| Dynamic recommendations | `src/components/TrendingNow.tsx` | ✅ |
| Real 5×5 bingo card | `src/components/BingoSection.tsx` | ✅ |
| Supabase-backed community rooms + chat | `src/components/CommunitySection.tsx` | ✅ |
| Supabase schema + RLS policies + seed rooms | `supabase/schema.sql` | ✅ |
| `.env` with your Supabase URL + anon key | `.env` | ✅ (already filled in) |

---

## Phase 1 — Run it locally (1 minute)

```bash
cd /Users/khyatidesai/Documents/Hackathon/bookbingo
npm install          # already done, re-run if node_modules is missing
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app boots immediately
against **localStorage** — no Supabase is required for a first look. Click
around and verify:

1. **Trending Books** shows six real covers pulled from Open Library.
2. Click a profession in **Browse by Profession** → the trending strip
   renames to _"Your Recommendations"_ and re-sorts to that field.
3. Tap one or more moods → recommendations blend them in.
4. Jump to **Book Bingo Challenge** → `New card` → a random 5×5 grid of
   reading challenges appears.
5. Tap a square → the book picker only shows books that satisfy that
   challenge. Pick one — the square lights up and the book is auto-saved
   to your reading list (top-right "My List").
6. Complete a row, column, or diagonal → squares turn green and a **Bingo!**
   banner appears.
7. Scroll to **Community** → you'll see "Offline mode — stored locally"
   until Phase 2 is done.

---

## Phase 2 — Wire Supabase (5 minutes)

Your `.env` already has the right URL + anon key. To make community rooms
(and card sync across devices) work, the Supabase project needs the schema
and anonymous auth turned on.

### 2a. Paste the schema

1. Go to [app.supabase.com](https://app.supabase.com) → your project
   (`xviwyocpzfrkyqghgyyu`).
2. **SQL Editor → New query**.
3. Open `supabase/schema.sql` in this repo, copy the whole file, paste it
   into the query window, click **Run**.
4. You should see "Success. No rows returned." and three seeded rooms in
   the `community_rooms` table.

### 2b. Enable anonymous sign-ins

1. **Authentication → Providers**.
2. Scroll to **Anonymous** at the bottom of the list → toggle it **on**.
3. Save.

(The storage layer already calls `signInAnonymously()` on boot. With this
flag off it silently falls back to localStorage — which is fine but means
community chat is local-only.)

### 2c. (Optional) Enable realtime

The SQL script already adds `room_messages` to the `supabase_realtime`
publication. Verify by going to **Database → Replication → supabase_realtime
→ Source** and confirming `room_messages` is listed. Without this, chat still
works — messages just require a refresh instead of streaming.

### 2d. Verify

Restart the dev server (`Ctrl+C`, `npm run dev`), hard-refresh the page,
scroll to Community — it should say "Synced to Supabase" and show the three
seeded rooms. Create a new room, join it, post a message, open the app in
an incognito window → the other client sees your message live.

---

## Phase 3 — (Optional) Real OpenAI recommendations

Everything ships with a rule-based recommender that's perfectly good for the
demo. To upgrade to OpenAI:

1. `npm i openai`
2. Add your key to `.env`:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```
   ⚠️ Since this is `VITE_` it will be bundled into the client. That's fine
   for a hackathon demo but **do not** ship a paid key that way in
   production — proxy through a Supabase Edge Function instead.
3. Implement the body of `recommendWithOpenAI()` in
   `src/lib/recommendations.ts`. The signature is already identical to
   `recommend()`, so you just swap the call site in `AppContext.tsx`:
   ```ts
   const recommendations = useMemo(() => recommendWithOpenAI({...}), [...]);
   ```

---

## Phase 4 — Ship it

```bash
npm run build        # outputs dist/
```

Deploy options:

- **Vercel / Netlify**: point at the repo, set the two env vars
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the dashboard, build
  command `npm run build`, publish `dist/`.
- **Supabase hosting**: `supabase link` → `supabase functions deploy` if
  you add Edge Functions for OpenAI. Static hosting works via any CDN.

Remember to add the production URL to **Authentication → URL Configuration
→ Site URL** in Supabase so anonymous auth redirects are allowed.

---

## Project map (so you know where to edit)

```
bookbingo/
├── .env                      # your Supabase URL + anon key (gitignored)
├── supabase/schema.sql       # paste into Supabase SQL editor
├── src/
│   ├── App.tsx               # single-page layout + global overlays
│   ├── types.ts              # core domain model
│   ├── context/
│   │   └── AppContext.tsx    # profile, filters, saved books, bingo cards
│   ├── data/
│   │   ├── books.ts          # 30-book seeded catalogue (Open Library covers)
│   │   ├── professions.ts
│   │   ├── moods.ts
│   │   └── bingoChallenges.ts # 28 challenges (criteria-based)
│   ├── lib/
│   │   ├── supabase.ts       # client (null when env vars are missing)
│   │   ├── storage.ts        # unified data layer w/ localStorage fallback
│   │   ├── recommendations.ts # rule-based + OpenAI hook
│   │   └── bingo.ts          # 5×5 generation, win detection, matching
│   └── components/
│       ├── Navbar.tsx        # + My List drawer trigger
│       ├── Hero.tsx          # unchanged from Bolt
│       ├── TrendingNow.tsx   # dynamic recommendations
│       ├── ProfessionCategories.tsx # sets filter
│       ├── MoodSection.tsx   # toggles filter
│       ├── BingoSection.tsx  # full 5×5 card + picker integration
│       ├── BookCard.tsx      # reusable tile w/ save toggle
│       ├── BookDetailModal.tsx
│       ├── BookPickerModal.tsx # filters catalogue by challenge
│       ├── SavedBooksDrawer.tsx
│       ├── CommunitySection.tsx # rooms list + chat drawer
│       ├── FeaturedCollections.tsx # unchanged from Bolt
│       └── Footer.tsx        # unchanged from Bolt
```

---

## Playbook → implementation mapping

From `Team 49 Workflow.pdf`:

| Playbook MVP | Where it lives |
| --- | --- |
| **Must:** Book recommendations (genre/mood/profession) | `TrendingNow` + `recommendations.ts` |
| **Must:** Bingo card challenge | `BingoSection` + `bingo.ts` |
| **Must:** Profession-based sorting | `ProfessionCategories` + `recommend()` scoring |
| **Should:** Mood-based filtering | `MoodSection` |
| **Should:** Community room (basic) | `CommunitySection` + Supabase rooms/messages |
| **Could:** Reviews/ratings | parked |
| **Could:** Leaderboard | parked |
| **Won't (this round):** Advanced AI recommendations | hook left in `recommendWithOpenAI()` |

The must-have flow from §4.3 —
_"User selects profession/mood → gets book recommendations → joins/creates
a Bingo card → tracks progress"_ — is exactly the vertical slice the app
now supports end-to-end.

---

## Troubleshooting

- **"Anonymous Supabase sign-in failed" in the console.** You skipped Phase
  2b. Turn on the Anonymous provider — the app still works with localStorage
  but community chat won't sync.
- **Book covers are missing.** Open Library returns 404 for a few ISBNs.
  `BookCard` falls back to a coloured placeholder with the title initial, so
  the layout never breaks.
- **Bingo card is empty after reload.** Make sure the `bingo_cards` table
  exists (Phase 2a). Without Supabase, the card lives in
  `localStorage["bookbingo.cards.<userId>"]`.
- **Community shows "Offline mode".** Either anonymous auth is off, or the
  env vars didn't load — restart `npm run dev` after editing `.env`.
