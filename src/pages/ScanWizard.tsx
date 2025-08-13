import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { DatabaseService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Scan, 
  MapPin, 
  Cloud, 
  Thermometer, 
  Droplets, 
  Leaf, 
  Beaker,
  Bug,
  Sprout,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

const ScanWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fieldDataLoading, setFieldDataLoading] = useState(true);
  const [scanData, setScanData] = useState({
    location: { lat: -1.2921, lng: 36.8219 }, // Nairobi coordinates
    weather: { temp: 24, humidity: 65, condition: 'Partly Cloudy' },
    soil: { ph: 6.5, moisture: 45, nutrients: 'Medium' },
    ndvi: 0.65,
    genotype: '',
    fertilization: '',
    irrigation: '',
    insects: '',
    soilph: ''
  });
  const [fieldData, setFieldData] = useState(null);

  useEffect(() => {
    // Fetch real field data on component mount
    fetchFieldData();
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const fetchFieldData = async () => {
    try {
      setFieldDataLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-field-data', {
        body: {
          lat: scanData.location.lat,
          lng: scanData.location.lng,
          parameters: ['weather', 'soil', 'vegetation', 'pests', 'growth']
        }
      });

      if (error) throw error;

      setFieldData(data);
      setScanData(prev => ({
        ...prev,
        location: data.location,
        weather: data.weather,
        soil: data.soil,
        ndvi: parseFloat(data.vegetation.ndvi)
      }));

      toast({
        title: t('scan.dataFetched', 'Field Data Updated'),
        description: t('scan.dataFetchedDesc', 'Latest field conditions have been loaded'),
      });
    } catch (error) {
      console.error('Error fetching field data:', error);
      toast({
        title: t('scan.dataError', 'Data Fetch Error'),
        description: t('scan.dataErrorDesc', 'Using cached data instead'),
        variant: 'destructive'
      });
    } finally {
      setFieldDataLoading(false);
    }
  };

  const getApiFeatures = () => {
    if (!fieldData) {
      return [
        { icon: MapPin, name: t('scan.gpsLocation', 'GPS Location'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Cloud, name: t('scan.weatherData', 'Weather Data'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Beaker, name: t('scan.soilAnalysis', 'Soil Analysis'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Leaf, name: t('scan.ndviIndex', 'NDVI Index'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Thermometer, name: t('scan.temperatureMap', 'Temperature Map'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Droplets, name: t('scan.moistureLevels', 'Moisture Levels'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Bug, name: t('scan.pestDetection', 'Pest Detection'), value: t('scan.fetching', 'Fetching...'), status: 'loading' },
        { icon: Sprout, name: t('scan.growthPrediction', 'Growth Prediction'), value: t('scan.fetching', 'Fetching...'), status: 'loading' }
      ];
    }

    return [
      { 
        icon: MapPin, 
        name: t('scan.gpsLocation', 'GPS Location'), 
        value: fieldData.location.address || `${fieldData.location.lat}, ${fieldData.location.lng}`, 
        status: 'completed' 
      },
      { 
        icon: Cloud, 
        name: t('scan.weatherData', 'Weather Data'), 
        value: `${fieldData.weather.temperature}°C, ${fieldData.weather.humidity}% humidity`, 
        status: 'completed' 
      },
      { 
        icon: Beaker, 
        name: t('scan.soilAnalysis', 'Soil Analysis'), 
        value: `pH ${fieldData.soil.ph}, ${fieldData.soil.nutrients} nutrients`, 
        status: 'completed' 
      },
      { 
        icon: Leaf, 
        name: t('scan.ndviIndex', 'NDVI Index'), 
        value: `${fieldData.vegetation.ndvi} - ${getVegetationHealth(fieldData.vegetation.ndvi)}`, 
        status: 'completed' 
      },
      { 
        icon: Thermometer, 
        name: t('scan.temperatureMap', 'Temperature Map'), 
        value: `${fieldData.weather.temperature}°C, UV Index: ${fieldData.weather.uvIndex}`, 
        status: 'completed' 
      },
      { 
        icon: Droplets, 
        name: t('scan.moistureLevels', 'Moisture Levels'), 
        value: `${fieldData.soil.moisture}% soil moisture`, 
        status: 'completed' 
      },
      { 
        icon: Bug, 
        name: t('scan.pestDetection', 'Pest Detection'), 
        value: fieldData.pests.detected ? `${fieldData.pests.severity} severity` : t('scan.noPests', 'No pests detected'), 
        status: 'completed' 
      },
      { 
        icon: Sprout, 
        name: t('scan.growthPrediction', 'Growth Prediction'), 
        value: `${fieldData.growthPrediction.yieldEstimate} kg/ha expected`, 
        status: 'completed' 
      }
    ];
  };

  const getVegetationHealth = (ndvi: string) => {
    const value = parseFloat(ndvi);
    if (value > 0.7) return t('scan.excellent', 'Excellent');
    if (value > 0.5) return t('scan.good', 'Good');
    if (value > 0.3) return t('scan.fair', 'Fair');
    return t('scan.poor', 'Poor');
  };

  const handleAssessment = (field: string, value: string) => {
    setScanData(prev => ({ ...prev, [field]: value }));
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      toast({
        title: t('scan.analyzing', 'Analyzing...'),
        description: t('scan.mlAnalysis', 'Running ML model for aflatoxin risk analysis'),
      });

      const { data: analysis, error } = await supabase.functions.invoke('analyze-aflatoxin', {
        body: {
          scanData,
          image: null // Will be populated when image upload is implemented
        }
      });

      if (error) throw error;

      // Save scan result using localStorage for now
      localStorage.setItem('lastScanResult', JSON.stringify({
        ...scanData,
        fieldData,
        analysis,
        timestamp: new Date().toISOString()
      }));

      toast({
        title: t('scan.analysisComplete', 'Analysis Complete'),
        description: t('scan.analysisCompleteDesc', 'AI model has processed your field data'),
      });

      navigate('/scan-results', { state: { scanData, fieldData, analysis } });
    } catch (error) {
      console.error('Error analyzing aflatoxin risk:', error);
      toast({
        title: t('scan.analysisError', 'Analysis Error'),
        description: t('scan.analysisErrorDesc', 'Failed to complete analysis. Please try again.'),
        variant: 'destructive'
      });
      
      // Fallback to local analysis
      const fallbackAnalysis = generateAnalysis(scanData);
      localStorage.setItem('lastScanResult', JSON.stringify({
        ...scanData,
        fieldData,
        analysis: fallbackAnalysis,
        timestamp: new Date().toISOString()
      }));
      navigate('/scan-results', { state: { scanData, fieldData, analysis: fallbackAnalysis } });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalysis = (data: typeof scanData) => {
    // Simplified risk calculation
    let riskScore = 0;
    
    if (data.genotype === 'poor') riskScore += 30;
    else if (data.genotype === 'average') riskScore += 15;
    
    if (data.fertilization === 'poor') riskScore += 25;
    else if (data.fertilization === 'average') riskScore += 10;
    
    if (data.irrigation === 'poor') riskScore += 20;
    else if (data.irrigation === 'average') riskScore += 8;
    
    if (data.insects === 'high') riskScore += 35;
    else if (data.insects === 'medium') riskScore += 15;
    
    if (data.soilph === 'poor') riskScore += 20;
    else if (data.soilph === 'average') riskScore += 8;

    const riskLevel = riskScore < 20 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : 'HIGH';
    const riskColor = riskLevel === 'LOW' ? 'green' : riskLevel === 'MEDIUM' ? 'yellow' : 'red';

    const recommendations = [
      t('scan.recommendation1', 'Consider soil nutrient supplementation'),
      t('scan.recommendation2', 'Monitor pest activity closely'),
      t('scan.recommendation3', 'Optimize irrigation schedule'),
      t('scan.recommendation4', 'Apply organic fertilizers for better soil health')
    ];

    const warnings = riskScore > 50 ? [
      t('scan.warning1', 'High risk detected - immediate action required'),
      t('scan.warning2', 'Pest infestation likely - apply treatment')
    ] : [];

    return {
      riskLevel,
      riskColor,
      riskScore,
      recommendations,
      warnings,
      nextSteps: [
        t('scan.nextStep1', 'Schedule follow-up scan in 2 weeks'), 
        t('scan.nextStep2', 'Implement recommended treatments')
      ]
    };
  };

  const renderScanInterface = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* Left Side - AI Chat Interface (40%) */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-full animate-fade-in hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-primary animate-pulse" />
              {t('scan.aiAssistant', 'AI Assistant')}
              <Sparkles className="w-4 h-4 text-accent animate-bounce" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg animate-slide-in-right">
              <p className="text-sm font-medium mb-2">{t('scan.aiGreeting', 'Hello! I\'m your AI farming assistant.')}</p>
              <p className="text-xs text-muted-foreground">
                {t('scan.aiDescription', 'I\'ll help analyze your field and provide expert recommendations based on 15+ parameters.')}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-accent/5 p-3 rounded-lg animate-fade-in" style={{ '--index': 1 } as any}>
                <p className="text-sm">
                  {t('scan.aiAdvice1', 'Your soil pH of 6.5 is optimal for most crops. Great work!')}
                </p>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg animate-fade-in" style={{ '--index': 2 } as any}>
                <p className="text-sm">
                  {t('scan.aiAdvice2', 'Weather conditions are favorable. Consider adjusting irrigation based on humidity levels.')}
                </p>
              </div>
            </div>

            <Button 
              onClick={() => window.open('https://google.com', '_blank')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white hover-glow animate-bounce-in"
              style={{ '--index': 3 } as any}
            >
              <Bot className="w-4 h-4 mr-2" />
              {t('scan.chatWithAI', 'Continue Chat with AI')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Scan Features (60%) */}
      <div className="lg:col-span-3 space-y-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-accent animate-spin" />
                {t('scan.fieldAnalysis', 'Field Analysis')}
              </div>
              <Badge variant="secondary" className="animate-pulse">
                {t('scan.live', 'Live')}
              </Badge>
            </CardTitle>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {getApiFeatures().map((feature, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-all duration-500 hover-scale animate-fade-in ${
                    feature.status === 'completed' 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-warning/10 border-warning/20'
                  }`}
                  style={{ '--index': index } as any}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <feature.icon className={`w-4 h-4 ${
                      feature.status === 'completed' ? 'text-success' : 'text-warning animate-pulse'
                    }`} />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.value}</p>
                </div>
              ))}
            </div>

            {step <= 5 && (
              <div className="space-y-4 animate-slide-in-right">
                <h3 className="font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary animate-bounce" />
                  {t('scan.assessment', 'Quick Assessment')} ({step}/5)
                </h3>
                
                {step === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm">{t('scan.genotype', 'Crop Genotype Quality:')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['excellent', 'average', 'poor'].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssessment('genotype', level)}
                          className="hover-scale animate-bounce-in"
                          style={{ '--index': level === 'excellent' ? 0 : level === 'average' ? 1 : 2 } as any}
                        >
                          {t(`scan.${level}`, level)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <p className="text-sm">{t('scan.fertilization', 'Fertilization Level:')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['excellent', 'average', 'poor'].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssessment('fertilization', level)}
                          className="hover-scale animate-bounce-in"
                          style={{ '--index': level === 'excellent' ? 0 : level === 'average' ? 1 : 2 } as any}
                        >
                          {t(`scan.${level}`, level)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-sm">{t('scan.irrigation', 'Irrigation System:')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['excellent', 'average', 'poor'].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssessment('irrigation', level)}
                          className="hover-scale animate-bounce-in"
                          style={{ '--index': level === 'excellent' ? 0 : level === 'average' ? 1 : 2 } as any}
                        >
                          {t(`scan.${level}`, level)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <p className="text-sm">{t('scan.insects', 'Insect Activity:')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssessment('insects', level)}
                          className="hover-scale animate-bounce-in"
                          style={{ '--index': level === 'low' ? 0 : level === 'medium' ? 1 : 2 } as any}
                        >
                          {t(`scan.${level}`, level)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-3">
                    <p className="text-sm">{t('scan.soilHealth', 'Overall Soil Health:')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['excellent', 'average', 'poor'].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssessment('soilph', level)}
                          className="hover-scale animate-bounce-in"
                          style={{ '--index': level === 'excellent' ? 0 : level === 'average' ? 1 : 2 } as any}
                        >
                          {t(`scan.${level}`, level)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step > 5 && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success text-white hover-glow animate-scale-in"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('scan.analyzing', 'Analyzing...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('scan.complete', 'Complete Analysis')}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover-scale"
          >
            ← {t('common.back', 'Back')}
          </Button>
          <h1 className="text-3xl font-bold text-primary animate-slide-in-right">
            {t('scan.title', 'AI-Powered Field Analysis')}
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ '--index': 1 } as any}>
            {t('scan.subtitle', 'Get comprehensive insights about your field with AI assistance')}
          </p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          {renderScanInterface()}
        </div>
      </div>
    </div>
  );
};

export default ScanWizard;