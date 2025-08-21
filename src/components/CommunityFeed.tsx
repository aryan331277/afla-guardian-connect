import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ttsService } from '@/lib/tts';
import { authService } from '@/lib/auth';
import { 
  Users, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share, 
  Trash2, 
  ChevronRight,
  TrendingUp 
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  author_id: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  author?: {
    full_name: string;
  };
  is_liked?: boolean;
  is_owner?: boolean;
}

const CommunityFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:farmer_users!community_posts_author_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const currentUser = authService.getCurrentUser();
      const postsWithUserInfo = data?.map(post => ({
        ...post,
        is_owner: post.author_id === currentUser?.id,
        is_liked: false // Would need to check post_likes table
      })) || [];

      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to post.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          content: newPostContent,
          author_id: currentUser.id
        }])
        .select(`
          *,
          author:farmer_users!community_posts_author_id_fkey(full_name)
        `)
        .single();

      if (error) throw error;

      const newPost = {
        ...data,
        is_owner: true,
        is_liked: false
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setShowNewPost(false);

      toast({
        title: "Success",
        description: "Your post has been shared with the community!",
      });

      await ttsService.speak("Your post has been shared with the community", 'en');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: currentUser.id });

        if (error) throw error;

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: currentUser.id }]);

        if (error) throw error;

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .match({ id: postId });

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, 'en');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Professional Network
                </h2>
                <p className="text-sm text-muted-foreground font-medium">Agricultural Intelligence Community</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Share Insight
            </Button>
          </div>

          {!showNewPost && (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gradient-to-br from-card to-primary/5 rounded-lg border border-primary/20 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary">2.3k</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Active Today</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-card to-blue-500/5 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-600">487</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">New Posts</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-card to-red-500/5 rounded-lg border border-red-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-red-500">1.2k</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Interactions</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-card to-green-500/5 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">95%</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Success Rate</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional New Post Form */}
      {showNewPost && (
        <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Share Professional Insight
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Textarea
              placeholder="Share your agricultural expertise, insights, or questions with the professional community..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[120px] resize-none border-primary/20 focus:border-primary/40 shadow-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">
                Sharing with {posts.length > 0 ? '2,300+' : '2,299'} agricultural professionals
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewPost(false)}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createPost}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Share Insight
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-primary-foreground">
                      {post.author?.full_name?.charAt(0) || 'F'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.author?.full_name || 'Agricultural Professional'}</p>
                    <p className="text-xs text-muted-foreground font-medium">{formatTime(post.created_at)}</p>
                  </div>
                </div>
                {post.is_owner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    className="text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={`hover:scale-105 transition-all duration-200 ${post.is_liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.likes_count}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:scale-105 transition-all duration-200 hover:text-blue-500">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="font-medium">{post.replies_count}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:scale-105 transition-all duration-200 hover:text-green-500">
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Professional View More Button */}
      <Card className="border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6 text-center">
          <Button 
            variant="outline" 
            className="w-full hover:scale-105 transition-all duration-300 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Explore More Professional Insights
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityFeed;