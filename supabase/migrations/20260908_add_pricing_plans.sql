-- ==============================================================================
-- Smyl Supabase Schema Migration: Add Pricing plans and Subscription status
-- Date: 2026-09-08
-- ==============================================================================

-- Add subscription/plan columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS customer_id TEXT, -- Stores Dodo/Stripe customer ID
ADD COLUMN IF NOT EXISTS subscription_id TEXT, -- Stores active Dodo/Stripe subscription ID
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Database-level trigger to enforce card limitations based on subscription plan
CREATE OR REPLACE FUNCTION public.enforce_card_limit_by_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
  v_card_count INTEGER;
BEGIN
  -- Get user plan from profiles
  SELECT plan INTO v_plan FROM public.profiles WHERE id = NEW.user_id;
  
  -- Default to free if profile or plan is missing
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  -- Only enforce on new cards (INSERTs)
  -- Count existing saved cards
  SELECT COUNT(*) INTO v_card_count FROM public.saved_cards WHERE user_id = NEW.user_id;

  IF v_plan = 'free' AND v_card_count >= 3 THEN
    RAISE EXCEPTION 'Free plan limit reached: you can only save up to 3 cards. Upgrade to Creator or Pro to save more!';
  ELSIF v_plan = 'creator' AND v_card_count >= 20 THEN
    RAISE EXCEPTION 'Creator plan limit reached: you can only save up to 20 cards. Upgrade to Pro to save unlimited cards!';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the card limit trigger
DROP TRIGGER IF EXISTS trg_enforce_card_limit ON public.saved_cards;
CREATE TRIGGER trg_enforce_card_limit
  BEFORE INSERT ON public.saved_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_card_limit_by_plan();
