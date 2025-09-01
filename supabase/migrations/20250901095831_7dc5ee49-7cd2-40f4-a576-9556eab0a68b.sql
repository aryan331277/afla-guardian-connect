-- Completely disable RLS and authentication requirements
-- This will make the app work without any login

-- Disable RLS on all tables to remove recursion issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_scans DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_gamification DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Drop all other problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON farmer_users;
DROP POLICY IF EXISTS "Users can update own profile" ON farmer_users;
DROP POLICY IF EXISTS "Allow public registration" ON farmer_users;

-- Create simple public access policies
CREATE POLICY "Public access" ON profiles FOR ALL USING (true);
CREATE POLICY "Public access" ON farmer_users FOR ALL USING (true);
CREATE POLICY "Public access" ON farmer_profiles FOR ALL USING (true);
CREATE POLICY "Public access" ON buyer_scans FOR ALL USING (true);
CREATE POLICY "Public access" ON farmer_insights FOR ALL USING (true);
CREATE POLICY "Public access" ON ai_conversations FOR ALL USING (true);
CREATE POLICY "Public access" ON buyer_gamification FOR ALL USING (true);
CREATE POLICY "Public access" ON user_sessions FOR ALL USING (true);
CREATE POLICY "Public access" ON community_posts FOR ALL USING (true);
CREATE POLICY "Public access" ON post_replies FOR ALL USING (true);
CREATE POLICY "Public access" ON post_likes FOR ALL USING (true);

-- Re-enable RLS with simple policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;