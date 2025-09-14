import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Scan, MapPin, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';

interface ScanRecord {
  id: string;
  date: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
  cropType: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  insights: string[];
}

const ScanHistory = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading scan history
    setTimeout(() => {
      const mockScans: ScanRecord[] = [
        {
          id: '1',
          date: '2024-01-28',
          location: 'Field A - North Section',
          riskLevel: 'low',
          cropType: 'Maize',
          temperature: 24,
          humidity: 65,
          soilMoisture: 78,
          insights: ['Optimal growing conditions', 'Continue current watering schedule']
        },
        {
          id: '2',
          date: '2024-01-25',
          location: 'Field B - East Section',
          riskLevel: 'medium',
          cropType: 'Beans',
          temperature: 28,
          humidity: 45,
          soilMoisture: 52,
          insights: ['Increase watering frequency', 'Monitor for pest activity']
        },
        {
          id: '3',
          date: '2024-01-22',
          location: 'Field A - South Section',
          riskLevel: 'high',
          cropType: 'Tomatoes',
          temperature: 32,
          humidity: 40,
          soilMoisture: 35,
          insights: ['Immediate irrigation needed', 'Consider shade protection', 'Check for disease signs']
        }
      ];
      setScans(mockScans);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSpeak = async (text: string) => {
    const language = localStorage.getItem('verdan-language') || 'en';
    await ttsService.speak(text, language as any);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <Scan className="w-16 h-16 mx-auto text-primary animate-spin" />
          <p className="text-lg text-muted-foreground">Loading scan history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 pb-20">
      {/* Header */}
      <div className="bg-card border-b p-4 animate-slide-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2 hover-scale"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2 animate-fade-in">
              <Scan className="w-6 h-6" />
              Scan History
              <button
                onClick={() => handleSpeak('Scan history page showing all your previous field scans')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </h1>
            <p className="text-muted-foreground">Total scans: {scans.length}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {scans.map((scan, index) => (
          <Card 
            key={scan.id} 
            className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in border-l-4 border-l-primary/20"
            style={{ 
              animationDelay: `${index * 100}ms`,
              '--index': index 
            } as any}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {scan.location}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(scan.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <Badge className={`${getRiskColor(scan.riskLevel)} flex items-center gap-1 capitalize animate-pulse`}>
                  {getRiskIcon(scan.riskLevel)}
                  {scan.riskLevel} Risk
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Crop Type</div>
                  <div className="font-medium">{scan.cropType}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Temperature</div>
                  <div className="font-medium">{scan.temperature}°C</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Humidity</div>
                  <div className="font-medium">{scan.humidity}%</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Soil Moisture</div>
                  <div className="font-medium">{scan.soilMoisture}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Key Insights</div>
                <div className="space-y-1">
                  {scan.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 animate-pulse" />
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover-scale"
                onClick={() => handleSpeak(`Scan from ${scan.location} on ${scan.date}. Risk level: ${scan.riskLevel}. Key insights: ${scan.insights.join('. ')}`)}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
                Read Details Aloud
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {scans.length === 0 && (
          <Card className="text-center p-8 animate-fade-in">
            <Scan className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Scans Yet</h3>
            <p className="text-muted-foreground mb-4">Start scanning your fields to see your history here</p>
            <Button onClick={() => navigate('/scan')} className="hover-scale">
              Start Your First Scan
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;