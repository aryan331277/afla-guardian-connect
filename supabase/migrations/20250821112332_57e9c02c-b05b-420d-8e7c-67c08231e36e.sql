-- Fix security issues from linter warnings

-- Fix search_path for functions (security warning)
CREATE OR REPLACE FUNCTION public.update_buyer_gamification(buyer_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  last_scan DATE;
  current_streak INTEGER;
BEGIN
  -- Get or create gamification record
  INSERT INTO public.buyer_gamification (buyer_id)
  VALUES (buyer_id)
  ON CONFLICT (buyer_id) DO NOTHING;
  
  -- Get current data
  SELECT last_scan_date, scan_streak INTO last_scan, current_streak
  FROM public.buyer_gamification
  WHERE buyer_gamification.buyer_id = update_buyer_gamification.buyer_id;
  
  -- Update streak logic
  IF last_scan IS NULL OR last_scan < current_date THEN
    IF last_scan = current_date - INTERVAL '1 day' THEN
      -- Continue streak
      current_streak := current_streak + 1;
    ELSE
      -- Reset streak
      current_streak := 1;
    END IF;
  END IF;
  
  -- Update gamification data
  UPDATE public.buyer_gamification 
  SET 
    total_points = total_points + points_to_add,
    scan_streak = current_streak,
    last_scan_date = current_date,
    total_scans = total_scans + 1,
    updated_at = now()
  WHERE buyer_gamification.buyer_id = update_buyer_gamification.buyer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.phone, '')
  );
  RETURN NEW;
END;
$$;