import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatabaseService, User } from '@/lib/database';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { MessageCircle, Scan, Users, Crown, Settings, Sun, Moon, Palette, User as ProfileIcon } from 'lucide-react';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await DatabaseService.getCurrentUser();
      if (!userData) {
        navigate('/language');
        return;
      }
      setUser(userData);
      await DatabaseService.updateUserActivity(userData.id!);
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/language');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = async (path: string, title: string) => {
    await ttsService.speak(`Opening ${title}`, user?.language || 'en');
    navigate(path);
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, user?.language || 'en');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'colorblind': return <Palette className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
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
      <div className="bg-card border-b p-4 animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2 animate-fade-in">
              {t('dashboard.title', 'Dashboard')}
              <button
                onClick={() => handleSpeak('Welcome to your farmer dashboard')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </h1>
            <p className="text-muted-foreground">Welcome back, {user?.currentTier || 'Farmer'}!</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="p-2"
            >
              <ProfileIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {getThemeIcon()}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/privacy')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-6 stagger-animation">
          <Card className="text-center hover-scale animate-bounce-in" style={{ '--index': 0 } as any}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary animate-float">{user?.gamificationPoints || 0}</div>
              <div className="text-sm text-muted-foreground">{t('game.points', 'Points')}</div>
            </CardContent>
          </Card>
          <Card className="text-center hover-scale animate-bounce-in" style={{ '--index': 1 } as any}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent animate-pulse">{user?.scanStreak || 0}</div>
              <div className="text-sm text-muted-foreground">{t('game.streak', 'Day Streak')}</div>
            </CardContent>
          </Card>
          <Card className="text-center hover-scale animate-bounce-in" style={{ '--index': 2 } as any}>
            <CardContent className="p-4">
              <Badge variant="secondary" className="text-xs animate-wiggle">
                {user?.currentTier || 'Curious Scout'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Buttons - Height ratios: 0.25 : 0.40 : 0.20 : 0.15 */}
        <div className="space-y-4 stagger-animation">
          {/* Chat with AI - 25% height */}
          <Button
            onClick={() => window.open('https://google.com', '_blank')}
            className="w-full h-24 text-left p-6 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground hover-glow animate-fade-in"
            variant="default"
            style={{ '--index': 0 } as any}
          >
            <div className="flex items-center w-full">
              <MessageCircle className="w-8 h-8 mr-4" />
              <div className="flex-1">
                <div className="text-xl font-semibold">{t('dashboard.chat', 'Chat with AI')}</div>
                <div className="text-sm opacity-90">Get expert advice and recommendations</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak('Chat with AI assistant for farming advice and recommendations');
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </div>
          </Button>

          {/* New Scan - 40% height */}
          <Button
            onClick={() => handleNavigate('/scan', 'Field Scanner')}
            className="w-full h-40 text-left p-6 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground hover-glow animate-fade-in"
            variant="secondary"
            style={{ '--index': 1 } as any}
          >
            <div className="flex items-center w-full h-full">
              <Scan className="w-12 h-12 mr-4" />
              <div className="flex-1">
                <div className="text-2xl font-semibold mb-2">{t('dashboard.scan', 'New Scan')}</div>
                <div className="text-sm opacity-90 mb-2">15-feature analysis wizard</div>
                <div className="text-xs opacity-75">GPS + Weather + Soil + Crop assessment</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak('New scan. Complete 15-feature analysis of your field including GPS, weather, soil and crop assessment');
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors self-start"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </div>
          </Button>

          {/* Community - 20% height */}
          <Button
            onClick={() => handleNavigate('/community', 'Community Forum')}
            className="w-full h-20 text-left p-4 bg-gradient-to-r from-success/90 to-success/70 hover:from-success hover:to-success/80 text-white hover-glow animate-fade-in"
            variant="secondary"
            style={{ '--index': 2 } as any}
          >
            <div className="flex items-center w-full">
              <Users className="w-6 h-6 mr-3" />
              <div className="flex-1">
                <div className="text-lg font-semibold">{t('dashboard.community', 'Community')}</div>
                <div className="text-sm opacity-90">Connect with local farmers</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak('Community forum. Connect and share with local farmers in your area');
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </div>
          </Button>

          {/* Upgrade Plan - 15% height */}
          <Button
            onClick={() => handleNavigate('/upgrade', 'Premium Upgrade')}
            className="w-full h-16 text-left p-4 bg-gradient-to-r from-warning/90 to-warning/70 hover:from-warning hover:to-warning/80 text-warning-foreground hover-glow animate-fade-in"
            variant="secondary"
            style={{ '--index': 3 } as any}
          >
            <div className="flex items-center w-full">
              <Crown className="w-5 h-5 mr-3" />
              <div className="flex-1">
                <div className="font-semibold">{t('dashboard.upgrade', 'Upgrade Plan')}</div>
                <div className="text-xs opacity-90">1000 KES - Remove ads & get expert support</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak('Upgrade to premium plan for 1000 Kenya shillings. Remove advertisements and get expert support');
                }}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;