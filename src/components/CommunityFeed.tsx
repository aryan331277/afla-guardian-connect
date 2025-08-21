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
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Community Forum
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowNewPost(true)}
              className="hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Button>
          </CardTitle>
        </CardHeader>
        {!showNewPost && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-bold text-primary">2.3k</p>
                <p className="text-xs text-muted-foreground">Active Today</p>
              </div>
              <div>
                <p className="font-bold text-primary">15k</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="font-bold text-primary">8.9k</p>
                <p className="text-xs text-muted-foreground">Solutions</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* New Post Form */}
      {showNewPost && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Share with the Community
              <button
                onClick={() => handleSpeak('Share your farming experience, ask questions, or give advice to help other farmers.')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share your farming experience, ask questions, or give advice..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button onClick={createPost} className="hover:scale-105 transition-transform">
                Post
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {post.author?.full_name?.charAt(0) || 'F'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{post.author?.full_name || 'Farmer'}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(post.created_at)}</p>
                  </div>
                </div>
                {post.is_owner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-4">{post.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={`hover:scale-105 transition-transform ${post.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                  {post.likes_count}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.replies_count}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:scale-105 transition-transform">
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View More Button */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Button variant="outline" className="w-full hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4 mr-2" />
            View More Posts
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityFeed;