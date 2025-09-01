import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/database';
import { authService } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useTheme } from '@/hooks/useTheme';
import { 
  Camera, 
  RecycleIcon, 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  Upload, 
  MapPin, 
  Star, 
  Phone,
  Building,
  ArrowLeft,
  Truck
} from 'lucide-react';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'scan' | 'ngo-marketplace' | 'pickup-request'>('dashboard');
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [grainQuantity, setGrainQuantity] = useState('');
  const [grainCondition, setGrainCondition] = useState('');

  // Mock NGO data
  const ngoData = [
    {
      id: 1,
      name: 'East Africa Food Relief',
      distance: '2.3 km',
      rating: 4.8,
      price: 25,
      description: 'Specializes in contaminated grain processing for livestock feed',
      phone: '+254712345678'
    },
    {
      id: 2,
      name: 'Kenya Agricultural Waste Management',
      distance: '4.7 km',
      rating: 4.5,
      price: 30,
      description: 'Converts rejected crops into bio-energy and organic fertilizer',
      phone: '+254798765432'
    },
    {
      id: 3,
      name: 'Community Grain Recovery Initiative',
      distance: '8.1 km',
      rating: 4.2,
      price: 20,
      description: 'Processes damaged grain for community feeding programs',
      phone: '+254723456789'
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
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
          currentTier: 'Buyer',
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

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'colorblind': return <Palette className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const calculateTransaction = () => {
    if (!selectedNGO || !grainQuantity) return 0;
    return parseInt(grainQuantity) * selectedNGO.price;
  };

  const handleSendPickupRequest = async () => {
    if (!selectedNGO || !grainQuantity || !grainCondition) {
      await ttsService.speak('Please fill in all required fields', 'en');
      return;
    }
    
    await ttsService.speak(`Pickup request sent to ${selectedNGO.name}. SMS will be sent to their phone number.`, 'en');
    // Here you would normally send the actual request
    alert(`Pickup request sent to ${selectedNGO.name}!\nSMS will be sent to ${selectedNGO.phone} with your pickup request details.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Header Component
  const Header = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AflaGuard</h1>
            <p className="text-sm text-gray-600">Professional Agriculture</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Sun className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
            </svg>
          </Button>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
            <span className="text-sm">0 pts</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
            <span className="text-sm">Curious Scout</span>
          </div>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-sm text-gray-600">Aryan<br/>buyer</span>
        </div>
      </div>
    </div>
  );

  // Upgrade Banner
  const UpgradeBanner = () => (
    <div className="bg-primary p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg">⭐</span>
          <span>Upgrade to Premium for advanced analytics and ad-free experience</span>
        </div>
        <Button variant="outline" className="bg-white text-primary border-white hover:bg-gray-100">
          Upgrade Now
        </Button>
      </div>
    </div>
  );

  // Corn Quality Assessment View
  const CornQualityAssessment = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corn Quality Assessment</h1>
          <p className="text-gray-600">Step 1 of 3 - AI-Powered Quality Analysis</p>
        </div>
        <Button variant="ghost" size="sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
          </svg>
        </Button>
      </div>

      <div className="bg-primary h-2 rounded-full mb-8">
        <div className="bg-primary h-full w-1/3 rounded-full"></div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Capture Corn Sample</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          <div className="bg-gray-100 rounded-2xl p-12 mb-6">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Take Photo of Corn Sample</h3>
            <p className="text-gray-600 mb-8">Position your camera over the corn kernels for AI analysis</p>
            
            <div className="flex gap-4 justify-center">
              <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                <Camera className="w-4 h-4" />
                Open Camera
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // NGO Marketplace View
  const NGOMarketplace = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NGO Marketplace</h1>
          <p className="text-gray-600">Find buyers for contaminated grain disposal</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* NGO List */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Building className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Nearby NGO Buyers</h2>
          </div>
          
          <div className="space-y-4">
            {ngoData.map((ngo) => (
              <Card 
                key={ngo.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedNGO?.id === ngo.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedNGO(ngo)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{ngo.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{ngo.price}</div>
                      <div className="text-sm text-gray-600">KES/kg</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {ngo.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {ngo.rating}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{ngo.description}</p>
                  
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{ngo.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pickup Request Form */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Pickup Request</h2>
          </div>
          
          {!selectedNGO ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an NGO to continue</h3>
                <p className="text-gray-600">Please select an NGO from the list to start your pickup request.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request from {selectedNGO.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Selected NGO:</span>
                    <span className="text-primary font-semibold">{selectedNGO.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rate:</span>
                    <span className="text-primary font-semibold">{selectedNGO.price} KES/kg</span>
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Grain Quantity (kg)</label>
                  <Input
                    type="number"
                    placeholder="54"
                    value={grainQuantity}
                    onChange={(e) => setGrainQuantity(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Grain Condition</label>
                  <Textarea
                    placeholder="good corn"
                    value={grainCondition}
                    onChange={(e) => setGrainCondition(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Transaction:</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {grainQuantity || '0'} kg × {selectedNGO.price} KES
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {calculateTransaction().toLocaleString()} KES
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSendPickupRequest}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!grainQuantity || !grainCondition}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Send Pickup Request
                </Button>
                
                <p className="text-sm text-gray-600 text-center">
                  An SMS will be sent to {selectedNGO.phone} with your pickup request details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  // Main Dashboard View
  const DashboardView = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Corn Quality Assessment */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setCurrentView('scan')}
        >
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Corn Quality Assessment</CardTitle>
            <p className="text-gray-600">AI-powered quality analysis</p>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">Start Assessment</Button>
          </CardContent>
        </Card>

        {/* NGO Marketplace */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setCurrentView('ngo-marketplace')}
        >
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RecycleIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">NGO Marketplace</CardTitle>
            <p className="text-gray-600">Contaminated grain disposal</p>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">Browse NGOs</Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Total Scans</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">Good Quality</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-muted-foreground">NGO Requests</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">KES Earned</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <UpgradeBanner />
      
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'scan' && <CornQualityAssessment />}
      {currentView === 'ngo-marketplace' && <NGOMarketplace />}
    </div>
  );
};

export default BuyerDashboard;