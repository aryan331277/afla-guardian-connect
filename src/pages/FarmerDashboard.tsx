import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/lib/database';
import { authService } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useLocationData } from '@/hooks/useLocationData';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Leaf, 
  RefreshCw, 
  Settings,
  Scan,
  BarChart3,
  MessageCircle,
  Bot,
  User as UserIcon,
  Sun,
  Moon,
  Palette, 
  TrendingUp
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LogoutButton from '@/components/LogoutButton';
import FarmerInsights from '@/components/FarmerInsights';
import CommunityFeed from '@/components/CommunityFeed';
import AIAssistant from '@/components/AIAssistant';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme, setTheme: setSpecificTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    location,
    weather,
    ndvi,
    soilMoisture,
    isLoading: dataLoading,
    error: dataError,
    permissionStatus,
    retry,
    refresh,
    canRetry,
    hasData
  } = useLocationData();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // AuthGuard already ensures user is authenticated
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Convert FarmerUser to User format for compatibility
        const userData: User = {
          phone: currentUser.phone_number,
          role: currentUser.role as any,
          language: 'en' as any, // Default language
          theme: 'light' as any, // Default theme
          hasUpgraded: false,
          createdAt: new Date(currentUser.created_at),
          lastSeen: new Date(),
          gamificationPoints: 0,
          scanStreak: 0,
          currentTier: 'Professional Farmer',
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

  const handleResourceClick = (resource: string) => {
    switch (resource) {
      case 'training':
        alert('Training Materials:\n• Best practices for aflatoxin prevention\n• Proper storage techniques\n• Crop rotation strategies\n• Post-harvest handling guidelines');
        break;
      case 'market':
        alert('Market Information:\n• Current corn prices: $180/ton\n• Quality premiums available\n• Certified buyer network\n• Export opportunities');
        break;
      case 'support':
        alert('Technical Support:\n• 24/7 helpline: +254-700-FARM\n• Field officer visits\n• WhatsApp support group\n• Online consultation booking');
        break;
      case 'finance':
        alert('Financial Services:\n• Crop insurance programs\n• Microfinance options\n• Equipment financing\n• Government subsidies information');
        break;
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'colorblind': return <Palette className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': case 'optimal': return 'bg-success';
      case 'good': case 'favorable': return 'bg-info';
      case 'fair': case 'moderate': return 'bg-warning';
      case 'poor': case 'dry': case 'very dry': return 'bg-destructive';
      default: return 'bg-destructive';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-sm sm:text-lg">AG</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">AflaGuard Pro</h1>
                </div>
              </div>
              {user && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1">
                  {user.currentTier}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={dataLoading}
                className="hover:bg-muted/50 p-2"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-muted/50 p-2"
                  >
                    {getThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={() => setSpecificTheme('light')}
                    className="flex items-center gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSpecificTheme('dark')}
                    className="flex items-center gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSpecificTheme('colorblind')}
                    className="flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    Colorblind
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="hover:bg-muted/50 p-2"
              >
                <UserIcon className="w-4 h-4" />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="insights" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 h-12">
            <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <FarmerInsights />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityFeed />
          </TabsContent>

          <TabsContent value="assistant" className="space-y-6">
            <AIAssistant />
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 sm:space-y-6">
            {/* Quick Action Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleNavigate('/scan', 'Crop Scanner')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Scan className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Scan Crops</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">AI-powered crop analysis and disease detection</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleNavigate('/insights-history', 'Data Insights')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-info/20 transition-colors">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-info" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">View Analytics</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Historical data and insights dashboard</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleNavigate('/community', 'Community Forum')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-success/20 transition-colors">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Forum</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Connect with other farmers and experts</p>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Data Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Weather Card */}
              <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-4 h-4 text-info" />
                      </div>
                      <span>Weather</span>
                    </div>
                    {weather && <span className="text-lg sm:text-2xl">{weather.icon}</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                  {dataLoading && !weather ? (
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 sm:h-4 bg-muted animate-pulse rounded w-3/4"></div>
                    </div>
                  ) : weather ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Temperature</span>
                        <span className="font-medium text-sm sm:text-base">{weather.temperature}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Humidity</span>
                        <span className="font-medium text-sm sm:text-base">{weather.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Rainfall</span>
                        <span className="font-medium text-sm sm:text-base">{weather.rainfall}mm</span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">{weather.description}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">Weather data unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* NDVI Card */}
              <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-success" />
                      </div>
                      <span>Vegetation</span>
                    </div>
                    {ndvi && (
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(ndvi.interpretation)} text-white border-none text-xs px-2 py-1`}
                      >
                        {ndvi.interpretation}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                  {dataLoading && !ndvi ? (
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 sm:h-4 bg-muted animate-pulse rounded w-2/3"></div>
                    </div>
                  ) : ndvi ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">NDVI Value</span>
                        <span className="font-medium text-sm sm:text-lg">{ndvi.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Cloud Cover</span>
                        <span className="font-medium text-sm sm:text-base">{ndvi.cloudCover}%</span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Data from {new Date(ndvi.date).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">NDVI data unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* Soil Moisture Card */}
              <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-info" />
                      </div>
                      <span>Soil Moisture</span>
                    </div>
                    {soilMoisture && (
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(soilMoisture.status)} text-white border-none text-xs px-2 py-1`}
                      >
                        {soilMoisture.status}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                  {dataLoading && !soilMoisture ? (
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 sm:h-4 bg-muted animate-pulse rounded w-4/5"></div>
                    </div>
                  ) : soilMoisture ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Moisture Level</span>
                        <span className="font-medium text-sm sm:text-base">{soilMoisture.moistureLevel}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Soil Temperature</span>
                        <span className="font-medium">{soilMoisture.temperature}°C</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">{soilMoisture.recommendation}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Soil moisture data unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 sm:space-y-6">
            {/* Resources Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleResourceClick('training')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Training Materials</h3>
                  <p className="text-xs sm:text-sm text-foreground">Best practices and guidelines for farming</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleResourceClick('market')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-success/20 transition-colors">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Market Information</h3>
                  <p className="text-xs sm:text-sm text-foreground">Current prices and market trends</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleResourceClick('support')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-info/20 transition-colors">
                    <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-info" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Technical Support</h3>
                  <p className="text-xs sm:text-sm text-foreground">Get help from agricultural experts</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border">
                <CardContent 
                  className="p-4 sm:p-6 text-center"
                  onClick={() => handleResourceClick('finance')}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-warning/20 transition-colors">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Financial Services</h3>
                  <p className="text-xs sm:text-sm text-foreground">Loans, insurance, and subsidies</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Data Source Info */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-foreground text-center">
            Data refreshed every 5 minutes • Location accuracy: ±{location?.accuracy.toFixed(0) || 'Unknown'}m • Powered by AI
          </p>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;