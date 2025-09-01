-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public access" ON profiles;
DROP POLICY IF EXISTS "Public access" ON farmer_users;
DROP POLICY IF EXISTS "Public access" ON farmer_profiles;
DROP POLICY IF EXISTS "Public access" ON buyer_scans;
DROP POLICY IF EXISTS "Public access" ON farmer_insights;
DROP POLICY IF EXISTS "Public access" ON ai_conversations;
DROP POLICY IF EXISTS "Public access" ON buyer_gamification;
DROP POLICY IF EXISTS "Public access" ON user_sessions;
DROP POLICY IF EXISTS "Public access" ON community_posts;
DROP POLICY IF EXISTS "Public access" ON post_replies;
DROP POLICY IF EXISTS "Public access" ON post_likes;

-- Drop all other existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Completely disable RLS to remove ALL authentication requirements
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