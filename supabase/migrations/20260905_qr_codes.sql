-- ==============================================================================
-- Smyl Supabase Schema Migration: QR Codes Table & RLS Policies
-- Date: 2026-09-05
-- ==============================================================================

-- Create QR Codes Table (Saves QR code configurations for authenticated users)
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- QR Codes RLS Policies:

-- 1. Users can read their own QR codes
CREATE POLICY "Users can read own qr codes"
  ON public.qr_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own QR codes
CREATE POLICY "Users can create own qr codes"
  ON public.qr_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own QR codes
CREATE POLICY "Users can update own qr codes"
  ON public.qr_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own QR codes
CREATE POLICY "Users can delete own qr codes"
  ON public.qr_codes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for lightning-fast user queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes (user_id);

-- Trigger to automatically handle updated_at timestamps on qr_codes
DROP TRIGGER IF EXISTS set_qr_codes_updated_at ON public.qr_codes;
CREATE TRIGGER set_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
