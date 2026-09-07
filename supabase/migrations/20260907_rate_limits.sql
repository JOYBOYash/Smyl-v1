-- Create Rate Limits Table for Stateless Server-Side Rate Limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_time BIGINT NOT NULL
);

-- Enable RLS (Service role only access, completely hidden from public/authenticated users)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public read/write policies exist for public/authenticated users on rate_limits.
-- This ensures only the server-admin/service-role client can ever inspect or alter rate limits.
