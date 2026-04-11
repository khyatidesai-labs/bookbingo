# Database Schema Updates for Username/Password Auth

Run these SQL commands in your Supabase SQL Editor to update the schema:

## Step 1: Add username column to profiles table

```sql
-- Add username column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- Create an index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add a check constraint to validate usernames
ALTER TABLE profiles 
ADD CONSTRAINT username_format_check 
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));
```

## Step 2: Create a users helper table (optional, for additional user data)

```sql
-- This table can store additional user information beyond what's in auth and profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy allowing users to read all users (for search/directory)
CREATE POLICY users_read_all ON users
  FOR SELECT
  USING (true);

-- Create policy allowing users to update their own record
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

## Step 3: Migrate existing profiles

```sql
-- For existing profiles without username, derive username from email
UPDATE profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;

-- For any profiles without email, generate a unique username
UPDATE profiles
SET username = 'user_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;
```

## Step 4: Add RLS policy for username lookups

```sql
-- Ensure the profiles table has a policy that allows reading by username
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for reading profiles by username (needed for authentication)
CREATE POLICY profiles_read_by_username ON profiles
  FOR SELECT
  USING (true);

-- Create policy for users to update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## After Running Migrations

1. Restart your Vite dev server: `npm run dev`
2. Test the auth flow:
   - Create a new account with a username
   - Verify the username appears in the profiles table
   - Sign in with that username/password
   - Check that recommendations and sharing still work

## Rollback (if needed)

```sql
-- Remove username column (back to email-only auth)
ALTER TABLE profiles DROP COLUMN username;

-- Or keep it but don't use it
UPDATE profiles SET username = NULL;
```
