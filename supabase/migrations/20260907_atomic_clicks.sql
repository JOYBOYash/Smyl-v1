-- RPC Function for Atomic Click Count Increments for Link Hub Items
CREATE OR REPLACE FUNCTION public.increment_hub_item_click_count(item_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.link_hub_items
  SET click_count = click_count + 1
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
