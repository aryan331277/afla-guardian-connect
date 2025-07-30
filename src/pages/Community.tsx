import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Plus, Heart, MessageCircle, Share, MoreHorizontal, Trash2 } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: number;
  isLiked: boolean;
  isOwner: boolean;
}

const Community = () => {
  const navigate = useNavigate();
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Mary K.',
      content: 'Just completed my first AflaGuard scan! The recommendations were very helpful. My maize is showing low risk for aflatoxin contamination.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      replies: 3,
      isLiked: false,
      isOwner: false
    },
    {
      id: '2',
      author: 'Joseph M.',
      content: 'Has anyone tried the new fertilizer recommendations from the AI? I am seeing good results in my field near Nakuru.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 8,
      replies: 7,
      isLiked: true,
      isOwner: false
    },
    {
      id: '3',
      author: 'Grace W.',
      content: 'Weather patterns have been strange this season. The app predicted humidity changes accurately and helped me adjust my drying schedule.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      likes: 15,
      replies: 5,
      isLiked: false,
      isOwner: true
    }
  ]);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'You',
      content: newPostContent,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
      isLiked: false,
      isOwner: true
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowNewPost(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6 animate-slide-in">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover-scale">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Community Forum</h1>
          <Button 
            size="sm" 
            className="ml-auto hover-glow" 
            onClick={() => setShowNewPost(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Post
          </Button>
        </div>

        {showNewPost && (
          <Card className="mb-6 animate-bounce-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Share with the Community
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
                <Button onClick={handleCreatePost} className="hover-scale">
                  Post
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {posts.map((post, index) => (
            <Card key={post.id} className="animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {post.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(post.timestamp)}</p>
                    </div>
                  </div>
                  {post.isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
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
                    onClick={() => handleLike(post.id)}
                    className={`hover-scale ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover-scale">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.replies}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover-scale">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary animate-float" />
              <h3 className="font-bold mb-2">Join the Discussion</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with over 10,000 farmers across Kenya sharing knowledge and experiences.
              </p>
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;