-- ==============================================================================
-- Smyl Supabase Schema Migration: Link Hubs and Link Hub Items
-- Date: 2026-09-06
-- ==============================================================================

-- 1. Create Link Hubs Table
CREATE TABLE IF NOT EXISTS public.link_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_path TEXT,
  theme_config JSONB NOT NULL DEFAULT '{"theme": "light", "background": "bg-[#F8FAFC]", "button_style": "rounded-xl border border-[#E1E5E9] bg-white text-[#17191C]"}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Link Hubs
ALTER TABLE public.link_hubs ENABLE ROW LEVEL SECURITY;

-- Link Hubs RLS Policies:
-- Users can read their own link hubs
CREATE POLICY "Users can read own link hubs"
  ON public.link_hubs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own link hubs
CREATE POLICY "Users can insert own link hubs"
  ON public.link_hubs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own link hubs
CREATE POLICY "Users can update own link hubs"
  ON public.link_hubs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own link hubs
CREATE POLICY "Users can delete own link hubs"
  ON public.link_hubs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public policy: Read only explicitly published hubs
CREATE POLICY "Public can read published link hubs"
  ON public.link_hubs
  FOR SELECT
  USING (is_published = true);


-- 2. Create Link Hub Items Table
CREATE TABLE IF NOT EXISTS public.link_hub_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES public.link_hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  destination_url TEXT NOT NULL,
  image_path TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Link Hub Items
ALTER TABLE public.link_hub_items ENABLE ROW LEVEL SECURITY;

-- Link Hub Items RLS Policies:
-- Users can access items of hubs they own
CREATE POLICY "Users can manage own link hub items"
  ON public.link_hub_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.link_hubs
      WHERE public.link_hubs.id = public.link_hub_items.hub_id
      AND public.link_hubs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.link_hubs
      WHERE public.link_hubs.id = public.link_hub_items.hub_id
      AND public.link_hubs.user_id = auth.uid()
    )
  );

-- Public policy: Read enabled items of published hubs
CREATE POLICY "Public can read enabled items of published link hubs"
  ON public.link_hub_items
  FOR SELECT
  USING (
    is_enabled = true AND
    EXISTS (
      SELECT 1 FROM public.link_hubs
      WHERE public.link_hubs.id = public.link_hub_items.hub_id
      AND public.link_hubs.is_published = true
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_hubs_user_id ON public.link_hubs (user_id);
CREATE INDEX IF NOT EXISTS idx_link_hubs_slug ON public.link_hubs (slug);
CREATE INDEX IF NOT EXISTS idx_link_hub_items_hub_id ON public.link_hub_items (hub_id);
CREATE INDEX IF NOT EXISTS idx_link_hub_items_position ON public.link_hub_items (position ASC);
