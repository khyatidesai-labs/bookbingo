-- FRESH PROFILES TABLE - Drop and recreate from scratch

-- Drop existing table (this will delete all data!)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create fresh profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255) DEFAULT 'Reader',
  email VARCHAR(255),
  avatar_url TEXT,
  profession VARCHAR(50),
  moods JSONB DEFAULT '[]'::jsonb,
  saved_book_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Add username constraint
ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
