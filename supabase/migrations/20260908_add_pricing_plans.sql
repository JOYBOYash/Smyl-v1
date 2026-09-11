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

  IF v_plan = 'free' AND v_card_count >= 10 THEN
    RAISE EXCEPTION 'Free plan limit reached: you can only save up to 10 cards. Upgrade to Creator or Pro to save more!';
  ELSIF v_plan = 'creator' AND v_card_count >= 100 THEN
    RAISE EXCEPTION 'Creator plan limit reached: you can only save up to 100 cards. Upgrade to Pro to save more!';
  ELSIF v_plan = 'pro' AND v_card_count >= 500 THEN
    RAISE EXCEPTION 'Pro plan limit reached: you can only save up to 500 cards. Upgrade to Lifetime for unlimited!';
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

-- Database-level trigger to enforce QR code limitations based on subscription plan
CREATE OR REPLACE FUNCTION public.enforce_qr_limit_by_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
  v_qr_count INTEGER;
  v_limit INTEGER;
  v_period TEXT;
BEGIN
  -- Get user plan from profiles
  SELECT plan INTO v_plan FROM public.profiles WHERE id = NEW.user_id;
  
  -- Default to free if profile or plan is missing
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  -- Unlimited for lifetime
  IF v_plan = 'lifetime' THEN
    RETURN NEW;
  END IF;

  -- Determine limits
  IF v_plan = 'free' THEN
    v_limit := 25;
  ELSIF v_plan = 'creator' THEN
    v_limit := 250;
  ELSIF v_plan = 'pro' THEN
    v_limit := 1000;
  ELSE
    v_limit := 25;
  END IF;

  -- Determine current month period (UTC)
  v_period := to_char(timezone('utc', now()), 'YYYY-MM');

  -- Count existing QR codes created in the current month
  SELECT COUNT(*) INTO v_qr_count 
  FROM public.qr_codes 
  WHERE user_id = NEW.user_id 
    AND to_char(timezone('utc', created_at), 'YYYY-MM') = v_period;

  IF v_qr_count >= v_limit THEN
    RAISE EXCEPTION '% plan monthly limit reached: you can only create up to % QR codes per month. Upgrade to a higher plan for higher limits!', INITCAP(v_plan), v_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the QR code limit trigger
DROP TRIGGER IF EXISTS trg_enforce_qr_limit ON public.qr_codes;
CREATE TRIGGER trg_enforce_qr_limit
  BEFORE INSERT ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_qr_limit_by_plan();
