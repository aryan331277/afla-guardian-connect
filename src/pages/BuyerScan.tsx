import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Camera, Check, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import { t } from '@/lib/i18n';
import { yoloService } from '@/services/yolo.service';
import { aflatoxinRiskService } from '@/services/aflatoxin-risk.service';
import { apiService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

const BuyerScan = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentStep, setCurrentStep] = useState<'camera' | 'questions' | 'analysis'>('camera');
  const [answers, setAnswers] = useState({
    storage: '',
    transport: ''
  });

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowCamera(false);
      setCurrentStep('questions');
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const analyzeRisk = async () => {
    if (!capturedImage) {
      toast({
        title: 'Error',
        description: 'No image captured',
        variant: 'destructive'
      });
      return;
    }

    setCurrentStep('analysis');

    try {
      // Step 1: Run YOLO detection
      toast({
        title: 'Analyzing',
        description: 'Detecting aflatoxin in corn sample...'
      });
      
      const detection = await yoloService.detectAflatoxin(capturedImage);
      
      console.log('YOLO Detection Results:', detection);

      // Step 2: Get weather data for temperature and humidity
      let temperature: number | undefined;
      let humidity: number | undefined;

      try {
        // Try to get user's location
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const weatherData = await apiService.fetchWeatherData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });

          temperature = weatherData.temperature;
          humidity = weatherData.humidity;
        }
      } catch (error) {
        console.log('Could not fetch weather data, continuing without it:', error);
      }

      // Step 3: Calculate risk using the formula
      const riskResult = aflatoxinRiskService.calculateRisk({
        healthyCount: detection.healthyCount,
        aflatoxinCount: detection.aflatoxinCount,
        transport: answers.transport,
        storage: answers.storage,
        temperature,
        humidity
      });

      // Step 4: Save results and navigate
      const payload = {
        riskLevel: riskResult.riskLevel,
        riskColor: riskResult.riskColor,
        riskScore: riskResult.riskScore,
        recommendations: riskResult.recommendations,
        warnings: riskResult.warnings,
        nextSteps: riskResult.nextSteps,
        timestamp: new Date().toISOString(),
        scanData: {
          image: capturedImage,
          answers,
          detection: riskResult.detectionDetails,
          environmental: { temperature, humidity }
        }
      };

      localStorage.setItem('lastScanResult', JSON.stringify(payload));
      
      toast({
        title: 'Analysis Complete',
        description: `Risk Level: ${riskResult.riskLevel}`
      });

      navigate('/scan-results');
    } catch (error) {
      console.error('Error analyzing risk:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to complete risk analysis. Please try again.',
        variant: 'destructive'
      });
      setCurrentStep('questions');
    }
  };

  const allQuestionsAnswered = answers.storage && answers.transport;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/buyer')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Corn Quality Scanner</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {t('scan.aflatoxinDetection', 'Aflatoxin Detection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 'camera' && (
              <>
                <div className="w-full max-w-md mx-auto bg-muted rounded-lg overflow-hidden">
                  {showCamera ? (
                    <div className="relative">
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button onClick={capture} size="lg" className="rounded-full w-16 h-16">
                          <Camera className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  ) : capturedImage ? (
                    <div className="relative">
                      <img src={capturedImage} alt="Captured corn" className="w-full h-64 object-cover" />
                      <div className="absolute top-2 right-2">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {!showCamera && !capturedImage && (
                  <Button onClick={() => setShowCamera(true)} size="lg" className="w-full">
                    {t('scan.startCamera', 'Start Camera')}
                  </Button>
                )}
                
                {capturedImage && (
                  <div className="flex gap-2">
                    <Button onClick={() => {setCapturedImage(null); setShowCamera(true);}} variant="outline" className="flex-1">
                      {t('scan.retake', 'Retake Photo')}
                    </Button>
                    <Button onClick={() => setCurrentStep('questions')} className="flex-1">
                      {t('scan.continue', 'Continue')}
                    </Button>
                  </div>
                )}
              </>
            )}

            {currentStep === 'questions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-center">{t('scan.questionsTitle', 'Storage & Transport Information')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">{t('scan.storageQuestion', 'How was this corn stored?')}</Label>
                    <RadioGroup value={answers.storage} onValueChange={(value) => handleAnswerChange('storage', value)} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dry-warehouse" id="dry-warehouse" />
                        <Label htmlFor="dry-warehouse">{t('scan.dryWarehouse', 'Dry warehouse (Excellent)')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outdoor-covered" id="outdoor-covered" />
                        <Label htmlFor="outdoor-covered">{t('scan.outdoorCovered', 'Outdoor covered area (Average)')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outdoor-open" id="outdoor-open" />
                        <Label htmlFor="outdoor-open">{t('scan.outdoorOpen', 'Outdoor open area (Bad)')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium">{t('scan.transportQuestion', 'How was this corn transported?')}</Label>
                    <RadioGroup value={answers.transport} onValueChange={(value) => handleAnswerChange('transport', value)} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="covered-truck" id="covered-truck" />
                        <Label htmlFor="covered-truck">{t('scan.coveredTruck', 'Covered truck (Excellent)')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sacks" id="sacks" />
                        <Label htmlFor="sacks">{t('scan.sacks', 'In sacks/bags (Average)')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="open-truck" id="open-truck" />
                        <Label htmlFor="open-truck">{t('scan.openTruck', 'Open truck (Bad)')}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button 
                  onClick={analyzeRisk} 
                  disabled={!allQuestionsAnswered} 
                  size="lg" 
                  className="w-full"
                >
                  {t('scan.analyzeAflatoxinRisk', 'Analyze Aflatoxin Risk')}
                </Button>
              </div>
            )}

            {currentStep === 'analysis' && (
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <p className="text-lg font-medium">{t('scan.analyzing', 'Analyzing corn sample...')}</p>
                  <p className="text-sm text-muted-foreground mt-2">Detecting aflatoxin contamination with AI</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerScan;
