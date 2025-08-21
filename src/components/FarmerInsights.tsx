import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ttsService } from '@/lib/tts';
import { authService } from '@/lib/auth';
import { useLocationData } from '@/hooks/useLocationData';
import { Droplets, Leaf, Bug, Sprout, RefreshCw, TrendingUp, TrendingDown, Minus, Plus, Save } from 'lucide-react';

interface FarmerInsight {
  id: string;
  soil_health: 'excellent' | 'average' | 'poor';
  water_availability: 'excellent' | 'average' | 'poor';
  pest_status: 'excellent' | 'average' | 'poor';
  fertilization_status: 'excellent' | 'average' | 'poor';
  measurement_date: string;
  recommendations: string[];
  notes?: string;
}

interface FarmerProfile {
  id: string;
  genotype: string;
  farm_size_hectares: number;
  main_crops: string[];
  years_experience: number;
}

const FarmerInsights = () => {
  const [insights, setInsights] = useState<FarmerInsight | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValues, setEditingValues] = useState({
    soil_health: 'average' as 'excellent' | 'average' | 'poor',
    water_availability: 'average' as 'excellent' | 'average' | 'poor',
    pest_status: 'average' as 'excellent' | 'average' | 'poor',
    fertilization_status: 'average' as 'excellent' | 'average' | 'poor'
  });
  const { toast } = useToast();
  const { location, weather, ndvi, soilMoisture } = useLocationData();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load farmer profile and latest insights
      const { data: profileData, error: profileError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      const { data: insightData, error: insightError } = await supabase
        .from('farmer_insights')
        .select('*')
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();

      if (insightError && insightError.code !== 'PGRST116') {
        console.error('Insight error:', insightError);
      } else if (insightData) {
        setInsights(insightData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setIsLoading(true);
    try {
      // First ensure we have a farmer profile
      if (!profile) {
        toast({
          title: "Profile Required",
          description: "Please set up your farmer profile first.",
          variant: "destructive",
        });
        return;
      }

      // Generate insights based on location data and environmental factors
      let recommendations = [
        'Apply organic compost to improve soil structure',
        'Monitor moisture levels daily during dry season',
        'Consider companion planting to reduce pest pressure',
        'Test soil pH levels before next fertilizer application'
      ];

      // Add location-based recommendations
      if (weather) {
        if (weather.humidity > 70) {
          recommendations.push('High humidity detected - monitor for fungal diseases');
        }
        if (weather.temperature > 30) {
          recommendations.push('High temperatures - ensure adequate irrigation');
        }
        if (weather.rainfall > 20) {
          recommendations.push('Heavy rainfall expected - improve drainage');
        }
      }

      if (ndvi) {
        if (ndvi.value < 0.3) {
          recommendations.push('Low vegetation health detected - consider fertilization');
        } else if (ndvi.value > 0.7) {
          recommendations.push('Excellent vegetation health - maintain current practices');
        }
      }

      if (soilMoisture) {
        recommendations.push(soilMoisture.recommendation);
      }

      const newInsight = {
        farmer_id: profile.id,
        soil_health: editingValues.soil_health,
        water_availability: editingValues.water_availability,
        pest_status: editingValues.pest_status,
        fertilization_status: editingValues.fertilization_status,
        recommendations: recommendations.slice(0, 6) // Limit to 6 recommendations
      };

      const { data, error } = await supabase
        .from('farmer_insights')
        .insert([newInsight])
        .select()
        .single();

      if (error) throw error;

      setInsights(data);
      setIsEditing(false);
      toast({
        title: "Insights Updated",
        description: "New insights generated with location data and your inputs.",
      });

      await ttsService.speak("Your insights have been updated with new recommendations based on your location and environmental data", 'en');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate new insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = () => {
    if (insights) {
      setEditingValues({
        soil_health: insights.soil_health,
        water_availability: insights.water_availability,
        pest_status: insights.pest_status,
        fertilization_status: insights.fertilization_status
      });
    }
    setIsEditing(true);
  };

  const handleSaveEdits = async () => {
    await generateNewInsights();
  };

  const updateGenotype = async (newGenotype: string) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from('farmer_profiles')
        .upsert({
          user_id: currentUser.id,
          genotype: newGenotype as 'drought_resistant' | 'high_yield' | 'pest_resistant' | 'early_maturing' | 'traditional',
          main_crops: ['maize'],
          years_experience: 5,
          farm_size_hectares: 2.5
        });

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, genotype: newGenotype } : null);
      toast({
        title: "Profile Updated",
        description: `Genotype updated to ${newGenotype}`,
      });
    } catch (error) {
      console.error('Error updating genotype:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'average': return 'bg-amber-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="w-4 h-4" />;
      case 'average': return <Minus className="w-4 h-4" />;
      case 'poor': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, 'en');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Genotype Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Farmer Genotype Profile
            </div>
            <button
              onClick={() => handleSpeak('Farmer genotype profile. Select your crop variety to get personalized insights and recommendations.')}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
              </svg>
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Crop Genotype</label>
              <Select value={profile?.genotype || 'traditional'} onValueChange={updateGenotype}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drought_resistant">Drought Resistant</SelectItem>
                  <SelectItem value="high_yield">High Yield</SelectItem>
                  <SelectItem value="pest_resistant">Pest Resistant</SelectItem>
                  <SelectItem value="early_maturing">Early Maturing</SelectItem>
                  <SelectItem value="traditional">Traditional Variety</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {!isEditing ? (
                <Button 
                  onClick={handleStartEditing} 
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Status Updates
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveEdits} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Generate
                </Button>
              )}
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateNewInsights} 
                disabled={isLoading || isEditing}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Auto Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Status Grid */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Update Farm Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Soil Health</label>
                <Select value={editingValues.soil_health} onValueChange={(value: any) => setEditingValues(prev => ({...prev, soil_health: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Water Availability</label>
                <Select value={editingValues.water_availability} onValueChange={(value: any) => setEditingValues(prev => ({...prev, water_availability: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Pest Status</label>
                <Select value={editingValues.pest_status} onValueChange={(value: any) => setEditingValues(prev => ({...prev, pest_status: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (No Pests)</SelectItem>
                    <SelectItem value="average">Average (Minor Issues)</SelectItem>
                    <SelectItem value="poor">Poor (Major Infestation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fertilization Status</label>
                <Select value={editingValues.fertilization_status} onValueChange={(value: any) => setEditingValues(prev => ({...prev, fertilization_status: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdits} disabled={isLoading} className="flex-1">
                {isLoading ? 'Generating...' : 'Save & Generate Insights'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="w-6 h-6 text-blue-600" />
                {getStatusIcon(insights?.soil_health || 'average')}
              </div>
              <h3 className="font-semibold mb-1">Soil Health</h3>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(insights?.soil_health || 'average')} text-white border-none`}
              >
                {insights?.soil_health || 'Average'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="w-6 h-6 text-cyan-600" />
                {getStatusIcon(insights?.water_availability || 'average')}
              </div>
              <h3 className="font-semibold mb-1">Water Availability</h3>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(insights?.water_availability || 'average')} text-white border-none`}
              >
                {insights?.water_availability || 'Average'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Bug className="w-6 h-6 text-orange-600" />
                {getStatusIcon(insights?.pest_status || 'average')}
              </div>
              <h3 className="font-semibold mb-1">Pest Status</h3>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(insights?.pest_status || 'average')} text-white border-none`}
              >
                {insights?.pest_status || 'Average'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Sprout className="w-6 h-6 text-green-600" />
                {getStatusIcon(insights?.fertilization_status || 'average')}
              </div>
              <h3 className="font-semibold mb-1">Fertilization</h3>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(insights?.fertilization_status || 'average')} text-white border-none`}
              >
                {insights?.fertilization_status || 'Average'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Genotype-Based Recommendations
              <button
                onClick={() => handleSpeak(`Your recommendations are: ${insights.recommendations.join('. ')}`)}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerInsights;