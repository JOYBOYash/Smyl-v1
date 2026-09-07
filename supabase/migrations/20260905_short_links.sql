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

-- 1. Only authenticated owners can read their own short links
CREATE POLICY "Users can read own short links"
  ON public.short_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert short links linked to their user_id, or anonymous short links (where user_id is null)
CREATE POLICY "Authenticated users can create short links"
  ON public.short_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Users can update their own short links (restricted to user_id ownership)
CREATE POLICY "Users can update own short links"
  ON public.short_links
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own short links (restricted to user_id ownership)
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

-- RPC Function for Atomic Click Count Increments (Resolves click count race conditions)
CREATE OR REPLACE FUNCTION public.increment_click_count(link_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.short_links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
