import { useState } from 'react';
import * as ort from 'onnxruntime-web';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Youtube,
  ExternalLink,
  X
} from 'lucide-react';

interface RiskAnalysisProps {
  insights: {
    soilHealth: string;
    waterAvailability: string;
    pestStatus: string;
    fertilizationStatus: string;
    gpsLocation?: { latitude: number; longitude: number };
    weather?: { temperature: number; humidity: number };
    ndvi?: { value: number };
    soilMoisture?: { moistureLevel: number };
  };
  onClose: () => void;
}

const RiskAnalysis = ({ insights, onClose }: RiskAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Encode insights into a numeric feature vector for ONNX model
  const encodeInsights = (): Float32Array => {
    const encodeCat = (v?: string) => {
      if (v === 'poor') return 1;
      if (v === 'average') return 0.5;
      return 0; // excellent or undefined
    };
    const temp = insights.weather?.temperature ?? 25; // typical default
    const humidity = insights.weather?.humidity ?? 50;
    const ndvi = typeof insights.ndvi?.value === 'number' ? insights.ndvi!.value : 0.5;
    const moisture = insights.soilMoisture?.moistureLevel ?? 40;

    // Normalize to 0-1 (simple min-max assumptions)
    const nTemp = Math.min(1, Math.max(0, (temp - 0) / 50)); // 0-50C
    const nHum = Math.min(1, Math.max(0, humidity / 100));
    const nNdvi = Math.min(1, Math.max(0, ndvi)); // NDVI 0-1
    const nMoist = Math.min(1, Math.max(0, moisture / 100));

    return new Float32Array([
      encodeCat(insights.soilHealth),
      encodeCat(insights.waterAvailability),
      encodeCat(insights.pestStatus),
      encodeCat(insights.fertilizationStatus),
      nTemp,
      nHum,
      nNdvi,
      nMoist,
    ]);
  };

  const predictWithOnnx = async (): Promise<number | null> => {
    try {
      const session = await ort.InferenceSession.create('/models/farmer.onnx');
      const features = encodeInsights();
      const input = new ort.Tensor('float32', features, [1, features.length]);
      // Use first input name for maximum compatibility
      const feeds: Record<string, ort.Tensor> = { } as any;
      // @ts-ignore - inputNames is available at runtime
      const inputName = (session as any).inputNames ? (session as any).inputNames[0] : 'input';
      feeds[inputName] = input;
      const outputMap = await session.run(feeds);
      const firstKey = Object.keys(outputMap)[0];
      const outTensor = outputMap[firstKey];
      const val: any = (outTensor as any).data ? (outTensor as any).data[0] : undefined;
      if (val == null) return null;
      const rawNum = typeof val === 'string' ? parseFloat(val) : Number(val);
      if (!isFinite(rawNum)) return null;
      // Assume model outputs 0-1; map to 0-100. If already 0-100, clamp.
      const score = rawNum <= 1 ? rawNum * 100 : rawNum;
      return Math.min(100, Math.max(0, score));
    } catch (e) {
      console.warn('ONNX model not available or failed, falling back:', e);
      return null;
    }
  };

  const calculateRiskScore = () => {
    let riskScore = 0;
    let factors = [];

    // Qualitative factors (40% weight)
    const qualitativeScore = [insights.soilHealth, insights.waterAvailability, insights.pestStatus, insights.fertilizationStatus]
      .reduce((score, status) => {
        if (status === 'poor') return score + 25;
        if (status === 'average') return score + 10;
        return score + 0;
      }, 0);

    riskScore += qualitativeScore * 0.4;

    // Environmental factors (60% weight)
    if (insights.weather) {
      if (insights.weather.humidity > 80) {
        riskScore += 15;
        factors.push('High humidity increases aflatoxin risk');
      }
      if (insights.weather.temperature > 30) {
        riskScore += 10;
        factors.push('High temperatures favor mold growth');
      }
    }

    if (insights.ndvi && insights.ndvi.value < 0.3) {
      riskScore += 15;
      factors.push('Low vegetation health indicates stress');
    }

    if (insights.soilMoisture && insights.soilMoisture.moistureLevel < 30) {
      riskScore += 10;
      factors.push('Low soil moisture causes plant stress');
    }

    // Normalize to 0-100 scale
    riskScore = Math.min(100, riskScore);

    return {
      score: riskScore,
      level: riskScore < 20 ? 'Low' : riskScore < 40 ? 'Moderate' : riskScore < 70 ? 'High' : 'Critical',
      factors: factors
    };
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);

    // Try ONNX model first if available (expects /public/models/farmer.onnx)
    let resultScore: number | null = await predictWithOnnx();
    let result:
      | { score: number; level: string; factors: string[] }
      | null = null;

    if (resultScore == null) {
      // Fallback to local heuristic
      result = calculateRiskScore();
    } else {
      // Build factors from insights for transparency
      const base = calculateRiskScore();
      result = {
        score: resultScore,
        level: resultScore < 20 ? 'Low' : resultScore < 40 ? 'Moderate' : resultScore < 70 ? 'High' : 'Critical',
        factors: base.factors,
      };
    }

    if (result) {
      setAnalysis({
        riskScore: result.score,
        riskLevel: result.level,
        riskFactors: result.factors,
        recommendations: generateRecommendations(result),
        videos: getRelevantVideos(result.level),
      });
    }

    setIsAnalyzing(false);
  };

  const generateRecommendations = (risk: any) => {
    const recommendations = [];
    
    if (risk.level === 'Critical' || risk.level === 'High') {
      recommendations.push('Implement immediate post-harvest drying protocols');
      recommendations.push('Use hermetic storage solutions');
      recommendations.push('Apply biocontrol agents (Aflasafe) during field stage');
    }
    
    if (insights.soilHealth === 'poor') {
      recommendations.push('Improve soil organic matter through composting');
    }
    
    if (insights.pestStatus === 'poor') {
      recommendations.push('Implement integrated pest management strategies');
    }
    
    recommendations.push('Monitor grain moisture content regularly');
    recommendations.push('Store crops in clean, dry environments');
    
    return recommendations;
  };

  const getRelevantVideos = (riskLevel: string) => {
    return [
      {
        title: 'Aflatoxin Prevention in Maize Storage',
        channel: 'AgriLearn Kenya',
        duration: '8:42',
        thumbnail: '🌽'
      },
      {
        title: 'Proper Crop Drying Techniques',
        channel: 'Farm Smart Africa',
        duration: '12:15',
        thumbnail: '☀️'
      },
      {
        title: 'Using Hermetic Storage Bags',
        channel: 'CGIAR Research',
        duration: '6:30',
        thumbnail: '📦'
      }
    ];
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'High': return 'bg-orange-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>
        <CardTitle className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <span className="text-primary">
            AI Risk Analysis
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {!analysis && !isAnalyzing && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aflatoxin Risk Assessment</h3>
            <p className="text-muted-foreground mb-6">
              Our AI model will analyze your 9 data points to assess aflatoxin contamination risk
            </p>
            <Button 
              onClick={runAnalysis}
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg"
            >
              <Activity className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Activity className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Data...</h3>
            <p className="text-muted-foreground mb-4">Processing 9 agricultural parameters</p>
            <Progress value={75} className="w-64 mx-auto" />
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Risk Score */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Risk Assessment</h3>
                  <Badge className={`${getRiskColor(analysis.riskLevel)} border-none px-4 py-2`}>
                    {analysis.riskLevel} Risk
                  </Badge>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">{analysis.riskScore.toFixed(0)}%</div>
                  <Progress value={analysis.riskScore} className="w-full h-3" />
                </div>

                {analysis.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Factors Identified
                    </h4>
                    <ul className="space-y-1">
                      {analysis.riskFactors.map((factor: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-green-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recommended Actions
                </h3>
                <div className="grid gap-3">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Educational Videos */}
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  Educational Resources
                </h3>
                <div className="grid gap-4">
                  {analysis.videos.map((video: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                      <div className="text-2xl">{video.thumbnail}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">{video.channel} • {video.duration}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskAnalysis;