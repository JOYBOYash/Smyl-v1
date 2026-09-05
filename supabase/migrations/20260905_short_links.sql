-- ==============================================================================
-- Smyl Supabase Schema Migration: Short Links Table & RLS Policies
-- Date: 2026-09-05
-- ==============================================================================

-- Create Short Links Table (Saves shortened URLs with optional ownership)
CREATE TABLE IF NOT EXISTS public.short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for anonymous short links
  slug TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  click_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Short Links RLS Policies:

-- 1. Anyone can read short links (crucial for server-side redirection and lookups)
CREATE POLICY "Anyone can read short links"
  ON public.short_links
  FOR SELECT
  USING (true);

-- 2. Authenticated users can insert short links linked to their user_id
CREATE POLICY "Authenticated users can create short links"
  ON public.short_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Anyone can create anonymous short links (where user_id is null)
CREATE POLICY "Anonymous users can create anonymous short links"
  ON public.short_links
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- 4. Users can update their own short links (restricted to user_id ownership)
CREATE POLICY "Users can update own short links"
  ON public.short_links
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Users can delete their own short links (restricted to user_id ownership)
CREATE POLICY "Users can delete own short links"
  ON public.short_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for lightning-fast slug lookups and user queries
CREATE INDEX IF NOT EXISTS idx_short_links_slug ON public.short_links (slug);
CREATE INDEX IF NOT EXISTS idx_short_links_user_id ON public.short_links (user_id);

-- Trigger to automatically handle updated_at timestamps on short_links
DROP TRIGGER IF EXISTS set_short_links_updated_at ON public.short_links;
CREATE TRIGGER set_short_links_updated_at
  BEFORE UPDATE ON public.short_links
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
