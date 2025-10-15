import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, ExternalLink, Activity, Thermometer, Droplets, Package, Truck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ScanResult {
  riskLevel: string;
  riskColor: string;
  riskScore: number;
  recommendations: string[];
  warnings: string[];
  nextSteps: string[];
  timestamp: string;
  scanData: {
    image?: string;
    answers?: {
      storage: string;
      transport: string;
    };
    detection?: {
      healthyCount: number;
      aflatoxinCount: number;
      totalCount: number;
      infectionRatio: number;
    };
    environmental?: {
      temperature?: number;
      humidity?: number;
    };
  };
}

const ScanResults = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastScanResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/buyer');
    }
  }, [navigate]);

  if (!result) {
    return <div className="p-4">Loading...</div>;
  }

  const detection = result.scanData?.detection;
  const environmental = result.scanData?.environmental;
  const answers = result.scanData?.answers;

  const getQualityLabel = (value: string) => {
    const mapping: Record<string, string> = {
      'covered-truck': 'Excellent',
      'sacks': 'Average',
      'open-truck': 'Bad',
      'dry-warehouse': 'Excellent',
      'outdoor-covered': 'Average',
      'outdoor-open': 'Bad'
    };
    return mapping[value] || value;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/buyer')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Aflatoxin Risk Analysis</h1>
        </div>

        <div className="grid gap-6">
          {/* Risk Score Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Risk Assessment</span>
                <Badge 
                  variant={result.riskScore < 25 ? 'default' : 
                          result.riskScore < 50 ? 'secondary' : 
                          result.riskScore < 75 ? 'outline' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {result.riskLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">{result.riskScore.toFixed(2)}%</span>
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                </div>
                <Progress value={result.riskScore} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                Analysis completed on {new Date(result.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* YOLO Detection Results */}
          {detection && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  AI Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {detection.healthyCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Healthy Kernels</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {detection.aflatoxinCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Aflatoxin Detected</div>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-lg font-semibold">
                    {detection.aflatoxinCount}/{detection.totalCount} kernels contaminated
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Infection Ratio: {(detection.infectionRatio * 100).toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storage & Transport Conditions */}
          {answers && (
            <Card>
              <CardHeader>
                <CardTitle>Handling Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Storage</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {answers.storage.replace(/-/g, ' ')}
                      </div>
                    </div>
                  </div>
                  <Badge>{getQualityLabel(answers.storage)}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Transport</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {answers.transport.replace(/-/g, ' ')}
                      </div>
                    </div>
                  </div>
                  <Badge>{getQualityLabel(answers.transport)}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Environmental Data from APIs */}
          {environmental && (environmental.temperature !== undefined || environmental.humidity !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Environmental Factors (Live Data)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {environmental.temperature !== undefined && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Thermometer className="w-6 h-6 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">{environmental.temperature.toFixed(1)}°C</div>
                      <div className="text-sm text-muted-foreground">Temperature</div>
                    </div>
                  </div>
                )}
                {environmental.humidity !== undefined && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Droplets className="w-6 h-6 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{environmental.humidity.toFixed(0)}%</div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Risk Calculation Breakdown */}
          {detection && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Risk Calculation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="text-sm">Infection Factor (55% weight)</span>
                  <span className="font-semibold">{(detection.infectionRatio * 55).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="text-sm">Transport Factor (15% weight)</span>
                  <span className="font-semibold">~{(15 * (answers?.transport === 'open-truck' ? 1 : answers?.transport === 'sacks' ? 0.5 : 0)).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="text-sm">Storage Factor (15% weight)</span>
                  <span className="font-semibold">~{(15 * (answers?.storage === 'outdoor-open' ? 1 : answers?.storage === 'outdoor-covered' ? 0.5 : 0)).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="text-sm">Environmental Factor (15% weight)</span>
                  <span className="font-semibold">Based on live API data</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg mt-2">
                  <span className="font-bold">Total Risk Score</span>
                  <span className="text-xl font-bold text-primary">{result.riskScore.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-orange-700 dark:text-orange-300">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Educational Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Educational Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => window.open('https://www.youtube.com/results?search_query=aflatoxin+prevention+maize', '_blank')}
              >
                <span>Watch: Aflatoxin Prevention Videos</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => window.open('https://www.kalro.org/aflatoxin-management', '_blank')}
              >
                <span>Read: KALRO Aflatoxin Management Guide</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/buyer-scan')}
              variant="outline"
              size="lg"
            >
              New Scan
            </Button>
            <Button 
              onClick={() => navigate('/buyer')}
              size="lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
