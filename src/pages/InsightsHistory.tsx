import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lightbulb, TrendingUp, Calendar, Star, Award, Target } from 'lucide-react';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';

interface Insight {
  id: string;
  date: string;
  title: string;
  category: 'weather' | 'soil' | 'crop' | 'pest' | 'disease' | 'irrigation';
  content: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionTaken: boolean;
  rating?: number;
}

const InsightsHistory = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    // Simulate loading insights
    setTimeout(() => {
      const mockInsights: Insight[] = [
        {
          id: '1',
          date: '2024-01-28',
          title: 'Optimal Irrigation Schedule',
          category: 'irrigation',
          content: 'Based on your soil moisture readings and weather forecast, water your maize field every 3 days early morning for best results.',
          confidence: 92,
          impact: 'high',
          actionTaken: true,
          rating: 5
        },
        {
          id: '2',
          date: '2024-01-25',
          title: 'Pest Prevention Strategy',
          category: 'pest',
          content: 'Early signs of aphid activity detected. Apply neem oil spray during evening hours to prevent infestation.',
          confidence: 87,
          impact: 'medium',
          actionTaken: true,
          rating: 4
        },
        {
          id: '3',
          date: '2024-01-22',
          title: 'Soil Nutrient Optimization',
          category: 'soil',
          content: 'Your soil shows low nitrogen levels. Consider organic compost application or nitrogen-rich fertilizer in the next 2 weeks.',
          confidence: 95,
          impact: 'high',
          actionTaken: false
        },
        {
          id: '4',
          date: '2024-01-20',
          title: 'Weather Alert',
          category: 'weather',
          content: 'Heavy rains expected in 3 days. Ensure proper drainage and consider harvesting mature crops early.',
          confidence: 88,
          impact: 'medium',
          actionTaken: true,
          rating: 5
        }
      ];
      setInsights(mockInsights);
      setTotalPoints(mockInsights.length * 25); // 25 points per insight
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSpeak = async (text: string) => {
    const language = localStorage.getItem('aflaguard-language') || 'en';
    await ttsService.speak(text, language as any);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weather': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'soil': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'crop': return 'text-green-600 bg-green-50 border-green-200';
      case 'pest': return 'text-red-600 bg-red-50 border-red-200';
      case 'disease': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'irrigation': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      default: return 'text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <Lightbulb className="w-16 h-16 mx-auto text-primary animate-bounce" />
          <p className="text-lg text-muted-foreground">Loading your insights...</p>
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
              <Lightbulb className="w-6 h-6" />
              Past Insights
              <button
                onClick={() => handleSpeak('Past insights page showing all AI recommendations and tips')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </h1>
            <p className="text-muted-foreground">Total insights: {insights.length}</p>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-primary animate-pulse" />
                <div>
                  <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                  <div className="text-sm text-muted-foreground">Points Earned from Insights</div>
                </div>
              </div>
              <Target className="w-12 h-12 text-accent/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 space-y-4">
        {insights.map((insight, index) => (
          <Card 
            key={insight.id} 
            className="hover-scale transition-all duration-300 hover:shadow-xl animate-fade-in border-l-4 border-l-accent"
            style={{ 
              animationDelay: `${index * 150}ms`,
              '--index': index 
            } as any}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent animate-pulse" />
                    {insight.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(insight.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <Badge className={`${getImpactColor(insight.impact)} capitalize animate-pulse`}>
                  {insight.impact} Impact
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className={`${getCategoryColor(insight.category)} capitalize border`}>
                  {insight.category}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {insight.confidence}% Confidence
                </Badge>
              </div>
              
              <p className="text-sm leading-relaxed">{insight.content}</p>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  {insight.actionTaken ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      ✓ Action Taken
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending Action
                    </Badge>
                  )}
                </div>
                
                {insight.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground mr-1">Rating:</span>
                    <div className="flex">{renderStars(insight.rating)}</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover-scale"
                  onClick={() => handleSpeak(`${insight.title}. ${insight.content}`)}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                  </svg>
                  Read Aloud
                </Button>
                {!insight.actionTaken && (
                  <Button size="sm" className="hover-scale">
                    Mark as Done
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {insights.length === 0 && (
          <Card className="text-center p-8 animate-fade-in">
            <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
            <p className="text-muted-foreground mb-4">Complete your first scan to get AI-powered farming insights</p>
            <Button onClick={() => navigate('/scan')} className="hover-scale">
              Get Your First Insight
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsightsHistory;