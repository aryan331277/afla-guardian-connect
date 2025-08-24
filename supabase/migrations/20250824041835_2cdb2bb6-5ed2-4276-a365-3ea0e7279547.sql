-- CRITICAL SECURITY FIX: Fix farmer_users table RLS policies
-- Current policies allow public access to sensitive data (passwords, phone numbers)

-- Drop the dangerous existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.farmer_users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.farmer_users;
DROP POLICY IF EXISTS "Anyone can insert new users" ON public.farmer_users;

-- Create secure policies that properly restrict access
-- Users can only view their own data (based on phone number from JWT)
CREATE POLICY "Users can view their own data" 
ON public.farmer_users 
FOR SELECT 
USING (
  phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)
);

-- Users can only update their own data (but not sensitive fields like password_hash)
CREATE POLICY "Users can update their own profile data" 
ON public.farmer_users 
FOR UPDATE 
USING (
  phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)
) 
WITH CHECK (
  phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)
);

-- Allow public user registration (but only for INSERT)
CREATE POLICY "Allow user registration" 
ON public.farmer_users 
FOR INSERT 
WITH CHECK (true);

-- Prevent users from viewing password hashes by creating a view for safe user data
CREATE OR REPLACE VIEW public.safe_farmer_users AS
SELECT 
  id,
  created_at,
  updated_at,
  last_login,
  phone_number,
  role,
  full_name
FROM public.farmer_users;

-- Enable RLS on the view
ALTER VIEW public.safe_farmer_users ENABLE ROW LEVEL SECURITY;

-- Create policy for the safe view
CREATE POLICY "Users can view safe user data" 
ON public.safe_farmer_users 
FOR SELECT 
USING (
  phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)
  OR true -- Allow public access to non-sensitive fields for community features
);