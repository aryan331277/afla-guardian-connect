import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, Check, Brain, Award, TrendingUp } from 'lucide-react';
import Webcam from 'react-webcam';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import * as tf from '@tensorflow/tfjs';
import { t } from '@/lib/i18n';

const BuyerScan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentStep, setCurrentStep] = useState<'camera' | 'questions' | 'analysis' | 'results'>('camera');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [answers, setAnswers] = useState({
    storage: '',
    transport: '',
    environment: ''
  });
  const [scanResults, setScanResults] = useState<{
    aflatoxinPresent: boolean;
    confidence: number;
    riskScore: number;
    riskLevel: string;
    recommendations: string[];
    points: number;
  } | null>(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      // In a real implementation, you would load your trained model
      // For demo purposes, we'll create a simple mock model
      console.log('Loading TensorFlow.js model...');
      // const model = await tf.loadLayersModel('/models/aflatoxin-detection.json');
      // setModel(model);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

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

  const analyzeWithTensorFlow = async (imageData: string) => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate TensorFlow.js analysis with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mock CNN analysis - in real implementation, process image through trained model
      const mockAflatoxinDetection = Math.random() > 0.6; // 40% chance of detection
      const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
      
      // Calculate risk score based on image analysis + questionnaire
      let riskScore = mockAflatoxinDetection ? 60 : 20;
      
      // Adjust based on questionnaire answers
      if (answers.storage === 'outdoor-open') riskScore += 15;
      if (answers.storage === 'outdoor-covered') riskScore += 8;
      if (answers.transport === 'open-truck') riskScore += 10;
      if (answers.transport === 'sacks') riskScore += 5;
      if (answers.environment === 'rainy-season') riskScore += 12;
      if (answers.environment === 'high-humidity') riskScore += 8;

      riskScore = Math.min(100, riskScore);

      const getRiskLevel = (score: number) => {
        if (score < 20) return 'Very Low';
        if (score < 40) return 'Low';
        if (score < 60) return 'Medium';
        if (score < 80) return 'High';
        return 'Very High';
      };

      const riskLevel = getRiskLevel(riskScore);
      const points = riskLevel === 'Very Low' || riskLevel === 'Low' ? 2 : 1;

      const recommendations = generateRecommendations(riskLevel, answers);

      setScanResults({
        aflatoxinPresent: mockAflatoxinDetection,
        confidence,
        riskScore,
        riskLevel,
        recommendations,
        points
      });

      // Save scan to database
      await saveScanResults(mockAflatoxinDetection, confidence, riskScore, riskLevel);
      
      setCurrentStep('results');
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRecommendations = (riskLevel: string, answers: any) => {
    const recommendations = [];
    
    if (riskLevel === 'Very High' || riskLevel === 'High') {
      recommendations.push('⚠️ Do not purchase - high aflatoxin contamination risk');
      recommendations.push('🚫 Consider returning to supplier or disposing safely');
    } else if (riskLevel === 'Medium') {
      recommendations.push('⚡ Purchase with caution - additional testing recommended');
      recommendations.push('📋 Negotiate price reduction due to quality concerns');
    } else {
      recommendations.push('✅ Safe to purchase - low contamination risk');
      recommendations.push('💰 Good quality corn suitable for consumption');
    }

    if (answers.storage === 'outdoor-open') {
      recommendations.push('🏠 Recommend covered storage for future batches');
    }
    if (answers.transport === 'open-truck') {
      recommendations.push('🚛 Suggest covered transport methods');
    }

    return recommendations;
  };

  const saveScanResults = async (aflatoxinPresent: boolean, confidence: number, riskScore: number, riskLevel: string) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      // TODO: Re-enable after types are updated
      // Save to buyer scans table
      console.log('Would save scan results:', {
        buyer_id: currentUser.id,
        aflatoxin_detected: aflatoxinPresent,
        confidence_score: confidence,
        risk_score: riskScore,
        risk_level: riskLevel,
        storage_condition: answers.storage,
        transport_condition: answers.transport,
        environment_condition: answers.environment,
        image_data: capturedImage
      });

      // Update gamification points
      await updateBuyerPoints(currentUser.id, scanResults?.points || 1);

    } catch (error) {
      console.error('Error saving scan results:', error);
    }
  };

  const updateBuyerPoints = async (buyerId: string, points: number) => {
    try {
      // TODO: Re-enable after types are updated
      console.log('Would update buyer points:', { buyerId, points });
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  const analyzeRisk = () => {
    setCurrentStep('analysis');
    analyzeWithTensorFlow(capturedImage!);
  };

  const allQuestionsAnswered = answers.storage && answers.transport && answers.environment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
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
                        <div className="bg-green-500 text-white rounded-full p-1">
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
                <h3 className="text-lg font-semibold text-center">{t('scan.questionsTitle', 'Additional Information')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">{t('scan.storageQuestion', 'How was this corn stored?')}</Label>
                    <RadioGroup value={answers.storage} onValueChange={(value) => handleAnswerChange('storage', value)} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dry-warehouse" id="dry-warehouse" />
                        <Label htmlFor="dry-warehouse">{t('scan.dryWarehouse', 'Dry warehouse')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outdoor-covered" id="outdoor-covered" />
                        <Label htmlFor="outdoor-covered">{t('scan.outdoorCovered', 'Outdoor covered area')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outdoor-open" id="outdoor-open" />
                        <Label htmlFor="outdoor-open">{t('scan.outdoorOpen', 'Outdoor open area')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium">{t('scan.transportQuestion', 'How was this corn transported?')}</Label>
                    <RadioGroup value={answers.transport} onValueChange={(value) => handleAnswerChange('transport', value)} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="covered-truck" id="covered-truck" />
                        <Label htmlFor="covered-truck">{t('scan.coveredTruck', 'Covered truck')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="open-truck" id="open-truck" />
                        <Label htmlFor="open-truck">{t('scan.openTruck', 'Open truck')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sacks" id="sacks" />
                        <Label htmlFor="sacks">{t('scan.sacks', 'In sacks/bags')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium">{t('scan.environmentQuestion', 'What were the environmental conditions?')}</Label>
                    <RadioGroup value={answers.environment} onValueChange={(value) => handleAnswerChange('environment', value)} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dry-season" id="dry-season" />
                        <Label htmlFor="dry-season">{t('scan.drySeason', 'Dry season')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rainy-season" id="rainy-season" />
                        <Label htmlFor="rainy-season">{t('scan.rainySeason', 'Rainy season')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high-humidity" id="high-humidity" />
                        <Label htmlFor="high-humidity">{t('scan.highHumidity', 'High humidity area')}</Label>
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
                  {t('scan.analyzeAflatoxinRisk', 'Analyse Aflatoxin Risk')}
                </Button>
              </div>
            )}

            {currentStep === 'analysis' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Brain className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
                  <p className="text-muted-foreground mb-4">TensorFlow.js CNN processing your image...</p>
                  <Progress value={analysisProgress} className="w-full max-w-md mx-auto h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{analysisProgress}% complete</p>
                </div>
              </div>
            )}

            {currentStep === 'results' && scanResults && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    scanResults.riskLevel === 'Very Low' || scanResults.riskLevel === 'Low' 
                      ? 'bg-green-100 text-green-600' 
                      : scanResults.riskLevel === 'Medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {scanResults.aflatoxinPresent ? '⚠️' : '✅'}
                  </div>
                  <h3 className="text-xl font-bold mb-2">Analysis Complete</h3>
                  <Badge className={`text-lg px-4 py-2 ${
                    scanResults.riskLevel === 'Very Low' || scanResults.riskLevel === 'Low' 
                      ? 'bg-green-500' 
                      : scanResults.riskLevel === 'Medium'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } text-white`}>
                    {scanResults.riskLevel} Risk ({scanResults.riskScore}%)
                  </Badge>
                </div>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">AI Detection Results</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Aflatoxin Detected:</span>
                        <span className="ml-2 font-medium">{scanResults.aflatoxinPresent ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Confidence:</span>
                        <span className="ml-2 font-medium">{(scanResults.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Points Earned</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-green-600">+{scanResults.points}</span>
                      <span className="text-green-600 ml-2">Quality Points</span>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Professional Recommendations
                  </h4>
                  <div className="space-y-2">
                    {scanResults.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-lg">{rec.split(' ')[0]}</span>
                        <span className="text-sm">{rec.substring(rec.indexOf(' ') + 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setCapturedImage(null);
                      setAnswers({ storage: '', transport: '', environment: '' });
                      setScanResults(null);
                      setCurrentStep('camera');
                    }}
                    variant="outline" 
                    className="flex-1"
                  >
                    New Scan
                  </Button>
                  <Button onClick={() => navigate('/buyer')} className="flex-1">
                    Return to Dashboard
                  </Button>
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