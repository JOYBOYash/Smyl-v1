-- RPC Function for Atomic Usage and Quota Control
CREATE OR REPLACE FUNCTION public.increment_usage_if_allowed(
  p_key TEXT,
  p_limit INTEGER,
  p_reset_time BIGINT
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INTEGER
) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Select and lock the row if it exists to ensure serializability
  SELECT count INTO v_count
  FROM public.rate_limits
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    -- If no record exists, insert the first increment and return true
    INSERT INTO public.rate_limits (key, count, reset_time)
    VALUES (p_key, 1, p_reset_time);
    RETURN QUERY SELECT TRUE, 1;
  ELSE
    -- If a record exists, check if count exceeds or meets limit
    IF v_count >= p_limit THEN
      RETURN QUERY SELECT FALSE, v_count;
    ELSE
      UPDATE public.rate_limits
      SET count = count + 1
      WHERE key = p_key;
      RETURN QUERY SELECT TRUE, v_count + 1;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
