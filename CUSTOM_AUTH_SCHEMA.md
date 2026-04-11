# Custom Auth Schema Migration (Email-Free)

Since email signups are disabled, we use custom username/password auth stored in the database.

## Required SQL Migration

Run this in **Supabase SQL Editor**:

```sql
-- Add columns to profiles table for custom auth
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add constraint for username format
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS username_format_check 
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));

-- Ensure all required columns have defaults
ALTER TABLE profiles 
ALTER COLUMN name SET DEFAULT 'Reader',
ALTER COLUMN moods SET DEFAULT '[]'::jsonb,
ALTER COLUMN saved_book_ids SET DEFAULT '[]'::jsonb;
```

That's it! No email verification needed. 🎉

---

## How Custom Auth Works

### Sign Up
1. User enters: username, password, display name (optional)
2. System generates unique user ID
3. Password is hashed and stored in `profiles.password_hash`
4. Username stored in `profiles.username`
5. Session token created in browser localStorage
6. User is immediately signed in ✅

### Sign In
1. User enters: username, password
2. System fetches profile by username
3. Hashes password and compares to stored hash
4. If match: session token created
5. User is signed in ✅

### No Emails Involved
- ❌ No confirmation emails
- ❌ No rate limits
- ❌ No email verification needed
- ❌ No magic links

---

## Testing

After running the migration:

```bash
npm run dev
```

1. Click "Sign in"
2. Click "Sign up"
3. Enter:
   - Username: `demo_user`
   - Password: `password123`
   - Display name: `Demo Reader` (optional)
4. Click "Create account"
5. Should be immediately signed in ✅

No email error! No rate limits! 🚀
