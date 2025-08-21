import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Scan,
  BarChart3,
  Settings
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

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
      case 'light': return <Thermometer className="w-4 h-4" />;
      case 'dark': return <Droplets className="w-4 h-4" />;
      default: return <Leaf className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">AG</span>
                </div>
                <h1 className="text-xl font-bold text-foreground">AflaGuard Pro</h1>
              </div>
              {user && (
                <Badge variant="outline" className="text-xs">
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
                className="hover:bg-muted"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hover:bg-muted"
              >
                {getThemeIcon()}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="hover:bg-muted"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Status */}
        <div className="mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Location Status</h3>
                    {location ? (
                      <p className="text-sm text-muted-foreground">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        <span className="ml-2 text-xs">
                          (±{location.accuracy.toFixed(0)}m accuracy)
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-destructive">Location not available</p>
                    )}
                  </div>
                </div>
                {hasData && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Handling */}
        {dataError && (
          <Alert className="mb-8 border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{dataError}</span>
              {canRetry && (
                <Button variant="outline" size="sm" onClick={retry}>
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Status */}
        {permissionStatus === 'denied' && (
          <Alert className="mb-8 border-yellow-500">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Location access is required for accurate agricultural data. Please enable location permissions in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            size="lg"
            onClick={() => handleNavigate('/scan', 'Crop Scanner')}
            className="h-16 flex items-center space-x-3 bg-primary hover:bg-primary/90"
          >
            <Scan className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Scan Crops</div>
              <div className="text-xs opacity-90">AI-powered analysis</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNavigate('/insights-history', 'Data Insights')}
            className="h-16 flex items-center space-x-3"
          >
            <BarChart3 className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">View Insights</div>
              <div className="text-xs opacity-75">Historical data</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNavigate('/profile', 'Profile Settings')}
            className="h-16 flex items-center space-x-3"
          >
            <Settings className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Settings</div>
              <div className="text-xs opacity-75">Manage preferences</div>
            </div>
          </Button>
        </div>

        {/* Data Source Info */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Data refreshed every 5 minutes • Location accuracy: ±{location?.accuracy.toFixed(0) || 'Unknown'}m
          </p>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;