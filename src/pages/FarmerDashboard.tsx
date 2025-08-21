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
  Palette
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import FarmerInsights from '@/components/FarmerInsights';
import CommunityFeed from '@/components/CommunityFeed';
import AIAssistant from '@/components/AIAssistant';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
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

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'colorblind': return <Palette className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': case 'optimal': return 'bg-green-500';
      case 'good': case 'favorable': return 'bg-blue-500';
      case 'fair': case 'moderate': return 'bg-yellow-500';
      case 'poor': case 'dry': case 'very dry': return 'bg-orange-500';
      default: return 'bg-red-500';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">AG</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AflaGuard Pro</h1>
                  <p className="text-xs text-muted-foreground">Agricultural Intelligence Platform</p>
                </div>
              </div>
              {user && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {user.currentTier}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={dataLoading}
                className="hover:bg-muted/50"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hover:bg-muted/50"
              >
                {getThemeIcon()}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="hover:bg-muted/50"
              >
                <UserIcon className="w-4 h-4" />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location & Weather Summary */}
        <div className="mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Current Location</h3>
                    {location ? (
                      <p className="text-sm text-muted-foreground">
                        GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-sm text-destructive">Location unavailable</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Weather</h3>
                    <p className="text-sm text-muted-foreground">
                      {weather ? `${weather.temperature}°C, ${weather.humidity}% humidity` : 'Loading...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Droplets className="w-6 h-6 text-cyan-500" />
                  <div>
                    <h3 className="font-semibold">Soil Moisture</h3>
                    <p className="text-sm text-muted-foreground">
                      {soilMoisture ? `${soilMoisture.moistureLevel}% - ${soilMoisture.status}` : 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Tools</span>
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

          <TabsContent value="tools" className="space-y-6">
            {/* Quick Action Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent 
                  className="p-6 text-center"
                  onClick={() => handleNavigate('/scan', 'Crop Scanner')}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Scan Crops</h3>
                  <p className="text-sm text-muted-foreground">AI-powered crop analysis and disease detection</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent 
                  className="p-6 text-center"
                  onClick={() => handleNavigate('/insights-history', 'Data Insights')}
                >
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Historical data and insights dashboard</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent 
                  className="p-6 text-center"
                  onClick={() => handleNavigate('/community', 'Community Forum')}
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Forum</h3>
                  <p className="text-sm text-muted-foreground">Connect with other farmers and experts</p>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Data Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Weather Card */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-5 h-5 text-blue-500" />
                      <span>Weather Conditions</span>
                    </div>
                    {weather && <span className="text-2xl">{weather.icon}</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataLoading && !weather ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                    </div>
                  ) : weather ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Temperature</span>
                        <span className="font-medium">{weather.temperature}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Humidity</span>
                        <span className="font-medium">{weather.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rainfall</span>
                        <span className="font-medium">{weather.rainfall}mm</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">{weather.description}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Weather data unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* NDVI Card */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-green-500" />
                      <span>Vegetation Index</span>
                    </div>
                    {ndvi && (
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(ndvi.interpretation)} text-white border-none`}
                      >
                        {ndvi.interpretation}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataLoading && !ndvi ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                    </div>
                  ) : ndvi ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">NDVI Value</span>
                        <span className="font-medium text-lg">{ndvi.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cloud Cover</span>
                        <span className="font-medium">{ndvi.cloudCover}%</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Data from {new Date(ndvi.date).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">NDVI data unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* Soil Moisture Card */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <span>Soil Moisture</span>
                    </div>
                    {soilMoisture && (
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(soilMoisture.status)} text-white border-none`}
                      >
                        {soilMoisture.status}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataLoading && !soilMoisture ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-4/5"></div>
                    </div>
                  ) : soilMoisture ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Moisture Level</span>
                        <span className="font-medium">{soilMoisture.moistureLevel}%</span>
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
        </Tabs>

        {/* Data Source Info */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Data refreshed every 5 minutes • Location accuracy: ±{location?.accuracy.toFixed(0) || 'Unknown'}m • Powered by AI
          </p>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;