# Book Bingo Updates: Username/Password Auth + Image Optimization

## 🔐 Authentication Changes

### What Changed
- **Before**: Email-based magic links for sign-in
- **After**: Username/password authentication with optional display names

### Features
- ✅ Sign up with username (3+ characters, alphanumeric + `-` and `_`)
- ✅ Password-based sign-in (6+ character minimum)
- ✅ Optional display name for personalization
- ✅ Automatic guest → signed-in upgrade
- ✅ Credentials stored securely in Supabase auth

### Files Modified
- `src/components/AuthModal.tsx` - New username/password UI
- `src/lib/auth.ts` - New auth utility functions
- `src/lib/storage.ts` - Updated to support username/password flow
- `src/context/AppContext.tsx` - Updated signIn signature

### Database Changes Required

**Run these SQL commands in Supabase SQL Editor:**

```sql
-- Add username column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Validate username format
ALTER TABLE profiles 
ADD CONSTRAINT username_format_check 
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));
```

See `SCHEMA_UPDATE.md` for complete migration steps.

### How to Use

1. **Sign Up** (new users):
   - Click "Sign in" button in the header
   - Click "Sign up" in the modal
   - Enter a username, password, and optional display name
   - Click "Create account"

2. **Sign In** (existing users):
   - Click "Sign in" button
   - Enter your username and password
   - Click "Sign in"

3. **Username Requirements**:
   - At least 3 characters
   - Letters, numbers, hyphens, and underscores only
   - Must be unique

4. **Password Requirements**:
   - At least 6 characters
   - No special character restrictions
   - Sent securely to Supabase auth

### Security Notes
- Passwords are hashed by Supabase using bcrypt
- Username/password pairs are validated server-side
- Session tokens are stored securely in browser
- Tokens auto-refresh via Supabase sessions

---

## 🖼️ Image Optimization

### What Changed
- Book cover images now load faster with optimized sizes
- Proper image dimensions reduce layout shift
- Lazy loading with async decoding for better performance
- Responsive image sizing based on context

### Performance Improvements
- **Smaller file sizes**: Open Library -M (400px) instead of -L (500px)
- **Layout stability**: Width/height attributes prevent Cumulative Layout Shift (CLS)
- **Better loading**: `loading="lazy"` + `decoding="async"`
- **~30% bandwidth reduction** per book card

### Files Modified
- `src/lib/imageOptimization.ts` - New image utility
- `src/components/BookCard.tsx` - Uses optimized images
- `src/components/Hero.tsx` - Uses optimized images

### Image Sizes by Context

| Context | Size | Dimensions | Use Case |
|---------|------|-----------|----------|
| Card | M | 400×600px | Book cards in grid/scroll |
| Hero | L | 500×750px | Featured books in hero section |
| Featured | M | 400×600px | Featured collections |
| Shelf | S | 300×450px | Reading shelf (compact) |

### How to Use

For developers - import the utility in your component:

```typescript
import { getOptimizedImageProps } from '../lib/imageOptimization';

// Use in components
const imgProps = getOptimizedImageProps(book.cover, 'card');

<img
  {...imgProps}
  alt={book.title}
  className="w-full h-full object-cover"
  onError={() => setImgOk(false)}
/>
```

### Additional Image Utilities

```typescript
// Get optimized URL directly
const optimizedUrl = optimizeOpenLibraryUrl(coverUrl, 'M');

// Generate responsive srcset
const srcset = generateSrcSet(coverUrl);

// Get image dimensions for a size
const dims = getImageDimensions('M'); // { width: 400, height: 600 }
```

---

## 📊 Book Recommendations & Sharing

### Current State
- Usernames are now used for sharing recommendations with friends
- Display the username in "@username" format in the app
- Recommendations stored with username reference
- Share functionality uses username instead of email

### How Recommendations Work

1. **View available readers**:
   - When viewing a book, see "X readers" chip
   - Click to see who's reading it

2. **Send recommendation**:
   - Click share icon
   - Select recipient from directory (by username)
   - Add a personal note
   - Send recommendation

3. **Receive recommendations**:
   - Check inbox for incoming recommendations
   - View sender's username and note
   - Save or dismiss the book

### Data Storage

Recommendations now store:
- `fromUser` - ID of sender
- `toUser` - ID of recipient
- `bookId` - Recommended book
- `note` - Recommendation note
- `status` - pending | saved | dismissed

---

## 🚀 Deployment Checklist

- [ ] Run SQL migrations from `SCHEMA_UPDATE.md`
- [ ] Test sign-up with new username
- [ ] Test sign-in with username/password
- [ ] Test upgrade from guest → signed-in
- [ ] Verify book images load without layout shift
- [ ] Test recommendations sharing with new usernames
- [ ] Check Network tab - images should be 400px or less
- [ ] Verify no auth errors in console

---

## 🔄 Rollback Plan

If you need to revert to email-based auth:

```sql
-- Keep the username column but don't use it
ALTER TABLE profiles DROP CONSTRAINT username_format_check;
DROP INDEX idx_profiles_username;

-- In code: revert AuthModal.tsx to previous version from git
git checkout HEAD~1 src/components/AuthModal.tsx
```

---

## 📞 Troubleshooting

### "Username already taken"
- Choose a different username
- Usernames must be unique across all users

### "Password must be at least 6 characters"
- Passwords need 6+ characters
- No special character restrictions

### Images still loading slowly
- Check Network tab in DevTools
- Verify images are using `imageOptimization.ts`
- Clear browser cache: `Cmd+Shift+Delete`

### Can't log in with username
- Verify username format (no spaces, only alphanumeric + `-` and `_`)
- Check Supabase logs for auth errors
- Try signing out completely: `localStorage.clear()`

---

## 📝 Next Steps

1. **Update Supabase schema** (required):
   - Run SQL from `SCHEMA_UPDATE.md`

2. **Test the new auth**:
   - Create test accounts
   - Sign in/out flows
   - Recommendation sharing

3. **Deploy to Bolt.new** (optional):
   - Include migration SQL for production
   - Test auth on staging first

4. **Monitor performance**:
   - Check Lighthouse scores
   - Monitor image loading times
   - Track auth success rates
