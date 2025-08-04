import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatabaseService, User } from '@/lib/database';
import { authService, FarmerUser } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { ArrowLeft, User as UserIcon, Phone, Calendar, Trophy, Scan, MessageSquare, Edit } from 'lucide-react';

const FarmerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [farmerUser, setFarmerUser] = useState<FarmerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await DatabaseService.getCurrentUser();
      const authUser = authService.getCurrentUser();
      
      if (!userData || !authUser) {
        navigate('/auth');
        return;
      }
      
      setUser(userData);
      setFarmerUser(authUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, user?.language || 'en');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 pb-20">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/farmer')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              {t('profile.title', 'My Profile')}
              <button
                onClick={() => handleSpeak('Farmer profile page')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header Card */}
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" alt={farmerUser?.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {farmerUser?.full_name ? getInitials(farmerUser.full_name) : 'F'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary">{farmerUser?.full_name}</h2>
                <Badge variant="secondary" className="mt-1">
                  {user?.currentTier || 'Curious Scout'}
                </Badge>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{farmerUser?.phone_number}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="text-center hover-scale transition-all duration-300 hover:shadow-xl hover:border-primary/30">
            <CardContent className="p-4">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary animate-bounce" />
              <div className="text-2xl font-bold text-primary animate-pulse">{user?.gamificationPoints || 0}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          
          <Card className="text-center hover-scale transition-all duration-300 hover:shadow-xl hover:border-accent/30">
            <CardContent className="p-4">
              <Scan className="w-8 h-8 mx-auto mb-2 text-accent animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="text-2xl font-bold text-accent animate-pulse">{user?.scanStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Member Since</span>
              <span>{farmerUser?.created_at ? formatDate(farmerUser.created_at) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Login</span>
              <span>{farmerUser?.last_login ? formatDate(farmerUser.last_login) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline">{farmerUser?.role || 'Farmer'}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scan className="w-5 h-5 text-accent" />
                <span>Past Scans</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">0</div>
                <div className="text-sm text-muted-foreground">Total scans</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-success" />
                <span>Community Contributions</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">0</div>
                <div className="text-sm text-muted-foreground">Posts & comments</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Insights Generated</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">0</div>
                <div className="text-sm text-muted-foreground">AI insights received</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Button 
            variant="outline" 
            className="w-full justify-start hover-scale transition-all duration-300 hover:shadow-lg hover:border-accent/50"
            onClick={() => navigate('/scan-history')}
          >
            <Scan className="w-4 h-4 mr-3 animate-pulse" />
            View Scan History
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start hover-scale transition-all duration-300 hover:shadow-lg hover:border-primary/50"
            onClick={() => navigate('/insights-history')}
          >
            <Trophy className="w-4 h-4 mr-3 animate-pulse" style={{ animationDelay: '200ms' }} />
            View Past Insights
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start hover-scale transition-all duration-300 hover:shadow-lg hover:border-success/50"
            onClick={() => navigate('/community')}
          >
            <MessageSquare className="w-4 h-4 mr-3 animate-pulse" style={{ animationDelay: '400ms' }} />
            My Community Activity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;