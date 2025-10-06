import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

interface ScanResult {
  riskLevel: string;
  riskColor: string;
  riskScore: number;
  recommendations: string[];
  warnings: string[];
  nextSteps: string[];
  timestamp: string;
  scanData: any;
}

const ScanResults = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastScanResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/farmer');
    }
  }, [navigate]);

  if (!result) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/farmer')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Scan Analysis Results</h1>
        </div>

        <div className="grid gap-6">
          {/* Risk Level Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Risk Assessment</span>
                <Badge 
                  variant={result.riskLevel.includes('Low') ? 'default' : 
                          result.riskLevel.includes('Medium') ? 'secondary' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {result.riskLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium mb-2">
                Risk Score: {result.riskScore}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full ${
                    result.riskScore >= 6 ? 'bg-red-500' :
                    result.riskScore >= 4 ? 'bg-orange-500' :
                    result.riskScore >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(result.riskScore / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Analysis completed on {new Date(result.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-orange-700">
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
                  <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
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
                Next Steps (7-Day Action Plan)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
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
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => window.open('https://m.facebook.com/groups/kenyanfarmers', '_blank')}
              >
                <span>Join: Kenyan Farmers Discussion Group</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/scan')}
              variant="outline"
              size="lg"
            >
              New Scan
            </Button>
            <Button 
              onClick={() => navigate('/farmer')}
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