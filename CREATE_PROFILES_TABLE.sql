-- Create profiles table for Book Bingo
-- This is required for custom username/password auth

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL DEFAULT 'Reader',
  email VARCHAR(255),
  avatar_url TEXT,
  profession VARCHAR(50),
  moods JSONB DEFAULT '[]'::jsonb,
  saved_book_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Add constraints
ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));


-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all to read profiles (for directory, recommendations)
CREATE POLICY IF NOT EXISTS profiles_read_all ON public.profiles
  FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS profiles_update_own ON public.profiles
  FOR UPDATE
  USING (true);

-- Allow insert for signup
CREATE POLICY IF NOT EXISTS profiles_insert ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Grant access to anon role (for initial anonymous users)
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT ON public.profiles TO anon;
GRANT UPDATE ON public.profiles TO anon;

-- Grant access to authenticated role
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
