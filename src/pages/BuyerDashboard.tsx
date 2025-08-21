import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/lib/database';
import { authService } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useTheme } from '@/hooks/useTheme';
import { Camera, RecycleIcon, Settings, Sun, Moon, Palette } from 'lucide-react';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // AuthGuard already ensures user is authenticated with correct role
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Convert FarmerUser to User format for compatibility
        const userData: User = {
          phone: currentUser.phone_number,
          role: currentUser.role as any,
          language: 'en' as any,
          theme: 'light' as any,
          hasUpgraded: false,
          createdAt: new Date(currentUser.created_at),
          lastSeen: new Date(),
          gamificationPoints: 0,
          scanStreak: 0,
          currentTier: 'Buyer',
          badges: []
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              {t('role.buyer', 'Buyer')} {t('dashboard.title', 'Dashboard')}
              <button
                onClick={() => handleSpeak('Welcome to your buyer dashboard')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </h1>
            <p className="text-muted-foreground">Corn quality assessment & verification</p>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{user?.gamificationPoints || 0}</div>
              <div className="text-sm text-muted-foreground">{t('game.points', 'Points')}</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">{user?.scanStreak || 0}</div>
              <div className="text-sm text-muted-foreground">{t('game.streak', 'Day Streak')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-6">
          {/* New Scan */}
          <Button
            onClick={() => handleNavigate('/buyer-scan', 'Corn Quality Scanner')}
            className="w-full h-32 text-left p-6 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground"
            variant="default"
          >
            <div className="flex items-center w-full h-full">
              <Camera className="w-10 h-10 mr-4" />
              <div className="flex-1">
                <div className="text-xl font-semibold mb-2">{t('dashboard.scan', 'New Scan')}</div>
                <div className="text-sm opacity-90 mb-1">Camera-based aflatoxin detection</div>
                <div className="text-xs opacity-75">Quick corn quality assessment</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak('New scan. Use camera to detect aflatoxin contamination and assess corn quality quickly');
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors self-start"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </div>
          </Button>

          {/* Resell Bad Corn */}
          <Button
            onClick={() => handleNavigate('/resell', 'Resell Bad Corn')}
            className="w-full h-24 text-left p-6 bg-gradient-to-r from-warning/90 to-warning/70 hover:from-warning hover:to-warning/80 text-warning-foreground"
            variant="secondary"
          >
            <div className="flex items-center w-full">
              <RecycleIcon className="w-8 h-8 mr-4" />
              <div className="flex-1">
                <div className="text-lg font-semibold">{t('buyer.resell', 'Resell Bad Corn')}</div>
                <div className="text-sm opacity-90">Connect with NGOs for contaminated corn</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak('Resell bad corn. Connect with non-governmental organizations to safely dispose of contaminated corn');
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </div>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Quick Tips
            <button
              onClick={() => handleSpeak('Quick tips for corn buyers. Always check for mold, unusual colors, and strong odors before purchase.')}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
              </svg>
            </button>
          </h3>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Check for visible mold or discoloration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Smell for musty or unusual odors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Look for insect damage or holes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Test moisture content if possible
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;