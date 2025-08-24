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

-- Users can only update their own data (excluding sensitive fields)
CREATE POLICY "Users can update their own profile data" 
ON public.farmer_users 
FOR UPDATE 
USING (
  phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)
) 
WITH CHECK (
  phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)
  AND OLD.password_hash = NEW.password_hash -- Prevent password hash changes via UPDATE
  AND OLD.phone_number = NEW.phone_number -- Prevent phone number changes via UPDATE
);

-- Allow public user registration (but only for INSERT)
CREATE POLICY "Allow user registration" 
ON public.farmer_users 
FOR INSERT 
WITH CHECK (true);

-- Create a security definer function to get user data safely for community features
CREATE OR REPLACE FUNCTION public.get_safe_user_info(user_id_param UUID)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    farmer_users.id,
    farmer_users.full_name,
    farmer_users.role,
    farmer_users.created_at
  FROM public.farmer_users
  WHERE farmer_users.id = user_id_param;
$$;