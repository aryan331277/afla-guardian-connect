-- Create buyer_scans table for buyer scan functionality
CREATE TABLE public.buyer_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  aflatoxin_detected BOOLEAN NOT NULL,
  confidence_score DECIMAL(4,3) NOT NULL,
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  storage_condition TEXT,
  transport_condition TEXT,
  environment_condition TEXT,
  image_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyer_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for buyer scans
CREATE POLICY "Users can view their own scans" 
ON public.buyer_scans 
FOR SELECT 
USING (buyer_id IN ( SELECT farmer_users.id
   FROM farmer_users
  WHERE (farmer_users.phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text))));

CREATE POLICY "Users can insert their own scans" 
ON public.buyer_scans 
FOR INSERT 
WITH CHECK (buyer_id IN ( SELECT farmer_users.id
   FROM farmer_users
  WHERE (farmer_users.phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text))));

-- Create buyer_gamification table for points and streaks
CREATE TABLE public.buyer_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  scan_streak INTEGER NOT NULL DEFAULT 0,
  last_scan_date DATE,
  total_scans INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyer_gamification ENABLE ROW LEVEL SECURITY;

-- Create policies for buyer gamification
CREATE POLICY "Users can view their own gamification data" 
ON public.buyer_gamification 
FOR SELECT 
USING (buyer_id IN ( SELECT farmer_users.id
   FROM farmer_users
  WHERE (farmer_users.phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text))));

CREATE POLICY "Users can update their own gamification data" 
ON public.buyer_gamification 
FOR ALL
USING (buyer_id IN ( SELECT farmer_users.id
   FROM farmer_users
  WHERE (farmer_users.phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text))));

-- Create function to update buyer gamification
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
$$ LANGUAGE plpgsql;

-- Create government_analytics view for aggregated data
CREATE OR REPLACE VIEW public.government_analytics AS
SELECT 
  COUNT(*) as total_scans,
  COUNT(DISTINCT buyer_id) as total_buyers,
  AVG(risk_score) as average_risk_score,
  COUNT(CASE WHEN risk_level IN ('High', 'Very High') THEN 1 END) as high_risk_scans,
  DATE_TRUNC('month', created_at) as month_year
FROM public.buyer_scans
GROUP BY DATE_TRUNC('month', created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_buyer_scans_updated_at
BEFORE UPDATE ON public.buyer_scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buyer_gamification_updated_at
BEFORE UPDATE ON public.buyer_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();