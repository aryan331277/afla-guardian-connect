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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      {/* Professional Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Buyer Dashboard
            </h1>
            <p className="text-muted-foreground font-medium">Professional Corn Quality Assessment Platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="border-primary/20 hover:bg-primary/5"
            >
              {getThemeIcon()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/privacy')}
              className="border-primary/20 hover:bg-primary/5"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Professional Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user?.gamificationPoints || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Quality Points</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{user?.scanStreak || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Scan Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Action Buttons */}
        <div className="space-y-4">
          {/* New Scan - Premium Styling */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-primary/20 bg-gradient-to-r from-primary/10 to-primary-dark/10">
            <CardContent className="p-0">
              <Button
                onClick={() => handleNavigate('/buyer-scan', 'Corn Quality Scanner')}
                className="w-full h-32 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg"
                variant="default"
              >
                <div className="flex items-center w-full h-full p-6">
                  <Camera className="w-12 h-12 mr-4" />
                  <div className="flex-1 text-left">
                    <div className="text-xl font-bold mb-2">AI Quality Scan</div>
                    <div className="text-sm opacity-90 mb-1">Advanced aflatoxin detection technology</div>
                    <div className="text-xs opacity-75">Professional corn assessment in seconds</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Resell Bad Corn - Professional Styling */}
          <Card className="hover:shadow-xl transition-all duration-300 border-accent/20 bg-gradient-to-r from-accent/10 to-accent/5">
            <CardContent className="p-0">
              <Button
                onClick={() => handleNavigate('/resell', 'Resell Bad Corn')}
                className="w-full h-24 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg"
                variant="secondary"
              >
                <div className="flex items-center w-full p-6">
                  <RecycleIcon className="w-8 h-8 mr-4" />
                  <div className="flex-1 text-left">
                    <div className="text-lg font-bold">NGO Partnership</div>
                    <div className="text-sm opacity-90">Sustainable disposal solutions</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Professional Tips Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Professional Assessment Guidelines
          </h3>
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-lg">
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Visual inspection for mold, discoloration, and damage</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Olfactory assessment for musty or unusual odors</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Insect damage and pest infestation analysis</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium">Moisture content verification (optimal: 13-14%)</span>
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