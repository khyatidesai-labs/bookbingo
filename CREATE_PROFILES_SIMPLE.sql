-- Create profiles table for Book Bingo (Simplified - No IF NOT EXISTS on policies)

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Constraints
ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS profiles_read_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;

-- Create policies (fresh)
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (true);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (true);

-- Grants
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT ON public.profiles TO anon;
GRANT UPDATE ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Auto-update timestamp function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
