-- Create UTM History Table for cloud-syncing generated links
CREATE TABLE IF NOT EXISTS public.utm_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_term TEXT,
  utm_content TEXT,
  generated_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.utm_history ENABLE ROW LEVEL SECURITY;

-- 1. Owners can read their own UTM history
CREATE POLICY "Users can read own utm history"
  ON public.utm_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Owners can create their own UTM history
CREATE POLICY "Users can insert own utm history"
  ON public.utm_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Owners can delete their own UTM history
CREATE POLICY "Users can delete own utm history"
  ON public.utm_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for lightning-fast history queries
CREATE INDEX IF NOT EXISTS idx_utm_history_user_id ON public.utm_history (user_id);
