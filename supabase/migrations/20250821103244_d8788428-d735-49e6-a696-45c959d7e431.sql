-- Create tables for farmer data and features

-- Create enum types
CREATE TYPE genotype_category AS ENUM ('drought_resistant', 'high_yield', 'pest_resistant', 'early_maturing', 'traditional');
CREATE TYPE health_rating AS ENUM ('excellent', 'average', 'poor');

-- Farmer profile data table
CREATE TABLE farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES farmer_users(id) ON DELETE CASCADE,
  genotype genotype_category DEFAULT 'traditional',
  farm_size_hectares DECIMAL(10,2),
  main_crops TEXT[] DEFAULT ARRAY['maize'],
  years_experience INTEGER DEFAULT 0,
  location_coordinates POINT,
  soil_type TEXT,
  water_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmer data insights table
CREATE TABLE farmer_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  soil_health health_rating DEFAULT 'average',
  water_availability health_rating DEFAULT 'average',
  pest_status health_rating DEFAULT 'average',
  fertilization_status health_rating DEFAULT 'average',
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES farmer_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community post likes table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES farmer_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Community post replies table
CREATE TABLE post_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES farmer_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI assistant conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Farmer profiles
CREATE POLICY "Users can view all profiles" ON farmer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON farmer_profiles FOR INSERT WITH CHECK (user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));
CREATE POLICY "Users can update their own profile" ON farmer_profiles FOR UPDATE USING (user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));

-- Farmer insights
CREATE POLICY "Users can view all insights" ON farmer_insights FOR SELECT USING (true);
CREATE POLICY "Users can insert their own insights" ON farmer_insights FOR INSERT WITH CHECK (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone')));
CREATE POLICY "Users can update their own insights" ON farmer_insights FOR UPDATE USING (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone')));

-- Community posts
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON community_posts FOR INSERT WITH CHECK (author_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (author_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (author_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));

-- Post likes
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));

-- Post replies
CREATE POLICY "Anyone can view replies" ON post_replies FOR SELECT USING (true);
CREATE POLICY "Users can add replies" ON post_replies FOR INSERT WITH CHECK (author_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));
CREATE POLICY "Users can update their own replies" ON post_replies FOR UPDATE USING (author_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));
CREATE POLICY "Users can delete their own replies" ON post_replies FOR DELETE USING (author_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone'));

-- AI conversations
CREATE POLICY "Users can view their own conversations" ON ai_conversations FOR SELECT USING (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone')));
CREATE POLICY "Users can insert their own conversations" ON ai_conversations FOR INSERT WITH CHECK (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone')));
CREATE POLICY "Users can update their own conversations" ON ai_conversations FOR UPDATE USING (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id IN (SELECT id FROM farmer_users WHERE phone_number = current_setting('request.jwt.claims')::json->>'phone')));

-- Create functions to update counters
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET replies_count = replies_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_post_likes_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER update_post_replies_trigger
  AFTER INSERT OR DELETE ON post_replies
  FOR EACH ROW EXECUTE FUNCTION update_post_replies_count();

-- Create trigger for farmer_profiles updated_at
CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for community_posts updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();