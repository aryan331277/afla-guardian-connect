-- Fix RLS policies for farmer_users to allow proper registration
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow user registration" ON farmer_users;
DROP POLICY IF EXISTS "Users can view their own data" ON farmer_users;
DROP POLICY IF EXISTS "Users can update their own profile data" ON farmer_users;

-- Create new working policies
-- Allow anyone to register (insert)
CREATE POLICY "Allow public registration" ON farmer_users
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own data
CREATE POLICY "Users can view own profile" ON farmer_users
FOR SELECT 
USING (id = (SELECT id FROM farmer_users WHERE phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)));

-- Allow users to update their own data
CREATE POLICY "Users can update own profile" ON farmer_users
FOR UPDATE 
USING (id = (SELECT id FROM farmer_users WHERE phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)))
WITH CHECK (id = (SELECT id FROM farmer_users WHERE phone_number = ((current_setting('request.jwt.claims'::text))::json ->> 'phone'::text)));