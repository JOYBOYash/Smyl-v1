-- ==============================================================================
-- Smyl Supabase Schema Migration: Profiles, Saved Cards, Storage, & RLS Policies
-- Date: 2026-09-01
-- ==============================================================================

-- 1. Create Profiles Table (Canonical identity linked to auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT DEFAULT '',
  avatar_path TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies:
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public profile view / foundation (Expose strictly public fields only)
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, username, display_name, avatar_path, bio
  FROM public.profiles;

-- 2. Create Saved Cards Table (User-owned card designs & customization state)
CREATE TABLE IF NOT EXISTS public.saved_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Card',
  source_url TEXT,
  platform TEXT NOT NULL DEFAULT 'x',
  post JSONB NOT NULL,
  customization JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Saved Cards
ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;

-- Saved Cards RLS Policies (SELECT, INSERT, UPDATE, DELETE):
CREATE POLICY "Users can read own saved cards"
  ON public.saved_cards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved cards"
  ON public.saved_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved cards"
  ON public.saved_cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved cards"
  ON public.saved_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_cards_user_id ON public.saved_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cards_created_at ON public.saved_cards (created_at DESC);

-- 3. Create User Assets Metadata Table (Optional persistent asset tracking)
CREATE TABLE IF NOT EXISTS public.user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'avatar',
  mime_type TEXT,
  size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assets metadata"
  ON public.user_assets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets metadata"
  ON public.user_assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets metadata"
  ON public.user_assets
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON public.user_assets (user_id);

-- 4. Trigger to automatically handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_saved_cards_updated_at ON public.saved_cards;
CREATE TRIGGER set_saved_cards_updated_at
  BEFORE UPDATE ON public.saved_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Storage Bucket Configuration and Policies
-- Ensure 'user-assets' bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Ensure user can only read, upload, update, and delete in their own folder (avatars/<user_id>/*)
CREATE POLICY "Users can read own assets from user-assets"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can upload own assets to user-assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can update own assets in user-assets"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete own assets in user-assets"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );
