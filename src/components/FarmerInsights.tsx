import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocationData } from '@/hooks/useLocationData';
import { authService } from '@/lib/auth';
import { 
  Leaf, 
  Droplets, 
  Bug, 
  Sprout, 
  MapPin, 
  Thermometer,
  Satellite,
  Activity,
  TrendingUp,
  RefreshCw,
  Save,
  Eye
} from 'lucide-react';

const FarmerInsights = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Manual farmer inputs (qualitative ratings)
  const [soilHealth, setSoilHealth] = useState<'excellent' | 'average' | 'poor'>('average');
  const [waterAvailability, setWaterAvailability] = useState<'excellent' | 'average' | 'poor'>('average');
  const [pestStatus, setPestStatus] = useState<'excellent' | 'average' | 'poor'>('average');
  const [fertilizationStatus, setFertilizationStatus] = useState<'excellent' | 'average' | 'poor'>('average');
  
  // Use location data hook for API data
  const {
    location,
    weather,
    ndvi,
    soilMoisture,
    isLoading: dataLoading,
    error: dataError,
    refresh
  } = useLocationData();

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    // Load existing farmer insight data from Supabase
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      // First get farmer profile
      const { data: profile } = await supabase
        .from('farmer_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from('farmer_insights')
          .select('*')
          .eq('farmer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setSoilHealth(data.soil_health);
          setWaterAvailability(data.water_availability);
          setPestStatus(data.pest_status);
          setFertilizationStatus(data.fertilization_status);
        }
      }
    } catch (error) {
      console.error('Error loading farmer data:', error);
    }
  };

  const saveInsights = async () => {
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "Please log in to save insights",
          variant: "destructive",
        });
        return;
      }

      // First get or create farmer profile
      let { data: profile } = await supabase
        .from('farmer_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('farmer_profiles')
          .insert({
            user_id: currentUser.id
          })
          .select('id')
          .single();

        if (profileError) throw profileError;
        profile = newProfile;
      }

      const { error } = await supabase
        .from('farmer_insights')
        .insert({
          farmer_id: profile.id,
          soil_health: soilHealth,
          water_availability: waterAvailability,
          pest_status: pestStatus,
          fertilization_status: fertilizationStatus,
          recommendations: generateRecommendations()
        });

      if (error) throw error;

      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Insights saved successfully!",
      });
    } catch (error) {
      console.error('Error saving insights:', error);
      toast({
        title: "Error",
        description: "Failed to save insights",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    // Generate recommendations based on all 9 insights
    if (soilHealth === 'poor') {
      recommendations.push('Consider soil testing and organic matter addition');
    }
    if (waterAvailability === 'poor') {
      recommendations.push('Implement water conservation techniques');
    }
    if (pestStatus === 'poor') {
      recommendations.push('Review integrated pest management strategies');
    }
    if (fertilizationStatus === 'poor') {
      recommendations.push('Consult on balanced fertilization program');
    }
    
    // Weather-based recommendations
    if (weather && weather.humidity > 80) {
      recommendations.push('High humidity detected - monitor for fungal diseases');
    }
    if (weather && weather.temperature > 30) {
      recommendations.push('High temperatures - ensure adequate irrigation');
    }
    
    // NDVI-based recommendations
    if (ndvi && ndvi.value < 0.3) {
      recommendations.push('Low vegetation index - consider crop nutrition assessment');
    }
    
    // Soil moisture recommendations
    if (soilMoisture && soilMoisture.moistureLevel < 30) {
      recommendations.push('Low soil moisture - increase irrigation frequency');
    }
    
    return recommendations;
  };

  const handleInputChange = (setter: Function, value: string) => {
    setter(value);
    setHasUnsavedChanges(true);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'average': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Farm Insights Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refresh}
            variant="outline"
            disabled={dataLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button 
            onClick={saveInsights}
            disabled={isLoading || !hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Insights
          </Button>
        </div>
      </div>

      {/* Manual Farmer Inputs - 4 Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="w-5 h-5 text-green-600" />
              Soil Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={soilHealth} onValueChange={(value) => handleInputChange(setSoilHealth, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getHealthColor(soilHealth)}`}
            >
              {soilHealth.charAt(0).toUpperCase() + soilHealth.slice(1)}
            </Badge>
            {hasUnsavedChanges && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </CardContent>
        </Card>

        <Card className="relative hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="w-5 h-5 text-blue-600" />
              Water Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={waterAvailability} onValueChange={(value) => handleInputChange(setWaterAvailability, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getHealthColor(waterAvailability)}`}
            >
              {waterAvailability.charAt(0).toUpperCase() + waterAvailability.slice(1)}
            </Badge>
            {hasUnsavedChanges && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </CardContent>
        </Card>

        <Card className="relative hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="w-5 h-5 text-red-600" />
              Pest Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={pestStatus} onValueChange={(value) => handleInputChange(setPestStatus, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getHealthColor(pestStatus)}`}
            >
              {pestStatus.charAt(0).toUpperCase() + pestStatus.slice(1)}
            </Badge>
            {hasUnsavedChanges && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </CardContent>
        </Card>

        <Card className="relative hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sprout className="w-5 h-5 text-yellow-600" />
              Fertilization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={fertilizationStatus} onValueChange={(value) => handleInputChange(setFertilizationStatus, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getHealthColor(fertilizationStatus)}`}
            >
              {fertilizationStatus.charAt(0).toUpperCase() + fertilizationStatus.slice(1)}
            </Badge>
            {hasUnsavedChanges && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Data - 5 Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-purple-600" />
              GPS Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-2 text-sm">
                <div>Lat: {location.latitude.toFixed(4)}</div>
                <div>Lng: {location.longitude.toFixed(4)}</div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ±{Math.round(location.accuracy)}m
                </Badge>
              </div>
            ) : dataLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-destructive text-sm">GPS unavailable</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="w-5 h-5 text-orange-600" />
              Weather Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weather ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>{weather.temperature}°C</span>
                  <span className="text-2xl">{weather.icon}</span>
                </div>
                <div>{weather.humidity}% humidity</div>
                <div>{weather.rainfall}mm rainfall</div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {weather.description}
                </Badge>
              </div>
            ) : dataLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-destructive text-sm">Weather unavailable</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Satellite className="w-5 h-5 text-green-600" />
              NDVI Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ndvi ? (
              <div className="space-y-2 text-sm">
                <div className="text-lg font-semibold text-green-700">{ndvi.value}</div>
                <Badge variant="outline" className={`
                  ${ndvi.interpretation === 'Excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                    ndvi.interpretation === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'}
                `}>
                  {ndvi.interpretation}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {new Date(ndvi.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Cloud: {ndvi.cloudCover}%
                </div>
              </div>
            ) : dataLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-destructive text-sm">NDVI unavailable</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-blue-600" />
              Soil Moisture
            </CardTitle>
          </CardHeader>
          <CardContent>
            {soilMoisture ? (
              <div className="space-y-2 text-sm">
                <div className="text-lg font-semibold text-blue-700">{soilMoisture.moistureLevel}%</div>
                <Badge variant="outline" className={`
                  ${soilMoisture.status === 'Optimal' ? 'bg-green-50 text-green-700 border-green-200' :
                    soilMoisture.status === 'Wet' || soilMoisture.status === 'Very Wet' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'}
                `}>
                  {soilMoisture.status}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Soil temp: {soilMoisture.temperature}°C
                </div>
              </div>
            ) : dataLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-destructive text-sm">Moisture unavailable</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations Panel */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            AI-Powered Recommendations
            <Badge variant="secondary" className="ml-2">
              9 Data Points Analyzed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {generateRecommendations().length > 0 ? (
              generateRecommendations().map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border shadow-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm leading-relaxed">{rec}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  All indicators look good! Continue monitoring your farm conditions.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerInsights;