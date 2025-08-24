import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, RiskLevel } from '@/lib/database';
import { authService } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useTheme } from '@/hooks/useTheme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Settings, Sun, Moon, Palette, TrendingUp, AlertTriangle, Users, MapPin } from 'lucide-react';

const GovernmentDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [selectedContamination, setSelectedContamination] = useState('all');

  // Mock data for demonstration
  const [analyticsData] = useState({
    totalScans: 2547,
    totalFarmers: 1823,
    averageRisk: 2.3,
    highRiskAreas: 12,
    regionData: [
      { name: 'Central', scans: 654, risk: 2.1, farmers: 445 },
      { name: 'Western', scans: 523, risk: 3.2, farmers: 398 },
      { name: 'Eastern', scans: 445, risk: 1.8, farmers: 312 },
      { name: 'Coast', scans: 321, risk: 2.7, farmers: 289 },
      { name: 'Northern', scans: 234, risk: 3.8, farmers: 198 },
      { name: 'Rift Valley', scans: 370, risk: 2.4, farmers: 181 }
    ],
    riskDistribution: [
      { name: 'Very Low', value: 342, color: 'hsl(139, 60%, 55%)' },
      { name: 'Low', value: 567, color: 'hsl(120, 50%, 65%)' },
      { name: 'Medium', value: 789, color: 'hsl(45, 85%, 65%)' },
      { name: 'High', value: 456, color: 'hsl(25, 80%, 60%)' },
      { name: 'Very High', value: 234, color: 'hsl(0, 75%, 60%)' }
    ],
    monthlyTrends: [
      { month: 'Jan', scans: 145, avgRisk: 2.1 },
      { month: 'Feb', scans: 198, avgRisk: 2.3 },
      { month: 'Mar', scans: 234, avgRisk: 2.7 },
      { month: 'Apr', scans: 289, avgRisk: 3.1 },
      { month: 'May', scans: 321, avgRisk: 2.9 },
      { month: 'Jun', scans: 356, avgRisk: 2.4 }
    ]
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // AuthGuard already ensures user is authenticated with correct role
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Convert FarmerUser to User format for compatibility
        const userData: User = {
          phone: currentUser.phone_number,
          role: currentUser.role as any,
          language: 'en' as any,
          theme: 'light' as any,
          hasUpgraded: false,
          createdAt: new Date(currentUser.created_at),
          lastSeen: new Date(),
          gamificationPoints: 0,
          scanStreak: 0,
          currentTier: 'Government Official',
          badges: []
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, user?.language || 'en');
  };

  const exportData = (format: 'pdf' | 'csv' | 'png') => {
    console.log(`Exporting data as ${format}`);
    // Implementation would go here
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'colorblind': return <Palette className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      {/* Professional Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Government Analytics
            </h1>
            <p className="text-muted-foreground font-medium">National Agricultural Intelligence Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="border-primary/20 hover:bg-primary/5"
            >
              {getThemeIcon()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/privacy')}
              className="border-primary/20 hover:bg-primary/5"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Professional Filters */}
        <Card className="bg-gradient-to-r from-card to-primary/5 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Analytics Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="border-primary/20 focus:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                    <SelectItem value="eastern">Eastern</SelectItem>
                    <SelectItem value="coast">Coast</SelectItem>
                    <SelectItem value="northern">Northern</SelectItem>
                    <SelectItem value="rift">Rift Valley</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Time Period</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="border-primary/20 focus:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="last3">Last 3 Months</SelectItem>
                    <SelectItem value="last6">Last 6 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Risk Level</label>
                <Select value={selectedContamination} onValueChange={setSelectedContamination}>
                  <SelectTrigger className="border-primary/20 focus:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="very-low">Very Low</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very-high">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold text-primary">{analyticsData.totalScans.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground font-medium">Total Assessments</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{analyticsData.totalFarmers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground font-medium">Active Farmers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-orange-500/5 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">{analyticsData.averageRisk.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground font-medium">Average Risk Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-red-500/5 border-red-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-red-600" />
              <div className="text-3xl font-bold text-red-600">{analyticsData.highRiskAreas}</div>
              <div className="text-sm text-muted-foreground font-medium">High Risk Areas</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Regional Risk Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Regional Risk Levels
                <button
                  onClick={() => handleSpeak('Regional risk levels chart. Shows aflatoxin contamination risk across different regions.')}
                  className="p-1 rounded-full hover:bg-accent transition-colors"
                >
                  <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                  </svg>
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="risk" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Risk Distribution
                <button
                  onClick={() => handleSpeak('Risk distribution pie chart. Shows the breakdown of contamination levels across all scans.')}
                  className="p-1 rounded-full hover:bg-accent transition-colors"
                >
                  <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                  </svg>
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Monthly Scan Trends
              <button
                onClick={() => handleSpeak('Monthly scan trends chart. Shows the number of scans and average risk scores over time.')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('gov.export', 'Export Data')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => exportData('pdf')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button 
                onClick={() => exportData('csv')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button 
                onClick={() => exportData('png')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PNG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resource Allocation Suggestions
              <button
                onClick={() => handleSpeak('Resource allocation suggestions. Based on current data, consider increasing agricultural extension services in high-risk regions.')}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <div className="font-medium">High Risk in Northern Region</div>
                  <div className="text-sm text-muted-foreground">
                    Consider deploying additional agricultural extension officers to areas with risk scores above 3.5
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Increase Training Programs</div>
                  <div className="text-sm text-muted-foreground">
                    Western region shows improvement with training - expand similar programs to other high-risk areas
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <div className="font-medium">Mobile Testing Units</div>
                  <div className="text-sm text-muted-foreground">
                    Deploy mobile testing labs to regions with limited scanner access to increase detection rates
                  </div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GovernmentDashboard;