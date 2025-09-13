import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/database';
import { authService } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useTheme } from '@/hooks/useTheme';
import { useCamera } from '@/hooks/useCamera';
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
  Truck,
  CheckCircle,
  TrendingUp,
  Shield,
  Users,
  Activity
} from 'lucide-react';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme: setSpecificTheme } = useTheme();
  const { takePhoto, selectFromGallery, photo, isLoading: cameraLoading } = useCamera();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'scan' | 'ngo-marketplace' | 'pickup-request'>('dashboard');
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [grainQuantity, setGrainQuantity] = useState('');
  const [grainCondition, setGrainCondition] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [transportCondition, setTransportCondition] = useState('');
  const [storageCondition, setStorageCondition] = useState('');
  const [showAssessmentQuestions, setShowAssessmentQuestions] = useState(false);

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

  const handleCameraCapture = async () => {
    const result = await takePhoto();
    if (result) {
      await ttsService.speak('Photo captured successfully.', 'en');
    }
  };

  const handleGallerySelect = async () => {
    const result = await selectFromGallery();
    if (result) {
      await ttsService.speak('Photo selected from gallery.', 'en');
    }
  };

  const handleLearnMore = () => {
    alert('Our AI-powered system provides 95% accuracy in detecting aflatoxin contamination using advanced computer vision and machine learning algorithms. The system analyzes visual patterns, color variations, and kernel characteristics to identify potential contamination.');
  };

  const handleViewNetwork = () => {
    setCurrentView('ngo-marketplace');
  };

  const handleViewTrends = () => {
    alert('Market Trends:\n• Current corn price: $180/ton\n• Quality grain demand: High\n• Contaminated grain disposal rate: $25-30/ton\n• Market forecast: Stable prices expected through harvest season');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-5 h-5" />;
      case 'colorblind': return <Palette className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'Dark Mode';
      case 'colorblind': return 'Colorblind Friendly';
      default: return 'Light Mode';
    }
  };

  const calculateTransaction = () => {
    if (!selectedNGO || !grainQuantity) return 0;
    return parseInt(grainQuantity) * selectedNGO.price;
  };

  const generateFinalAssessment = async () => {
    if (!photo?.webPath) {
      await ttsService.speak('Please capture a photo first before generating assessment.', 'en');
      return;
    }
    
    if (!transportCondition || !storageCondition) {
      await ttsService.speak('Please answer all assessment questions before generating the report.', 'en');
      return;
    }

    setScanProgress(25);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanProgress(50);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanProgress(75);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanProgress(100);
    
    // Generate assessment based on image + transport + storage conditions
    const assessmentResult = calculateQualityScore();
    
    setTimeout(() => {
      alert(`AI Assessment Complete!\n\nOverall Quality: ${assessmentResult.grade}\nTransport: ${transportCondition}\nStorage: ${storageCondition}\n\nRecommendation: ${assessmentResult.recommendation}\n\n${assessmentResult.grade === 'Poor' ? 'Consider using the NGO Marketplace to dispose of contaminated grain safely.' : 'Your grain quality looks good for market sale!'}`);
      setScanProgress(0);
      
      // Reset assessment after completion
      if (assessmentResult.grade === 'Poor') {
        setTimeout(() => {
          setCurrentView('ngo-marketplace');
        }, 2000);
      }
    }, 500);
  };

  const calculateQualityScore = () => {
    const scores = {
      'Poor': 1,
      'Average': 2,
      'Excellent': 3
    };
    
    const transportScore = scores[transportCondition] || 0;
    const storageScore = scores[storageCondition] || 0;
    const avgScore = (transportScore + storageScore) / 2;
    
    if (avgScore >= 2.5) {
      return { grade: 'Excellent', recommendation: 'Safe for consumption and market sale' };
    } else if (avgScore >= 1.5) {
      return { grade: 'Average', recommendation: 'Suitable for processing or feed use' };
    } else {
      return { grade: 'Poor', recommendation: 'Recommend disposal through NGO network' };
    }
  };

  const handleSendPickupRequest = async () => {
    if (!selectedNGO || !grainQuantity || !grainCondition) {
      await ttsService.speak('Please fill in all required fields', 'en');
      alert('Please fill in all required fields:\n- Select an NGO\n- Enter grain quantity\n- Describe grain condition');
      return;
    }
    
    const quantity = parseInt(grainQuantity);
    if (quantity <= 0 || isNaN(quantity)) {
      await ttsService.speak('Please enter a valid quantity greater than zero', 'en');
      alert('Please enter a valid quantity greater than zero');
      return;
    }
    
    try {
      await ttsService.speak(`Pickup request sent to ${selectedNGO.name}.`, 'en');
      alert(`Pickup request sent to ${selectedNGO.name}!\n\nDetails:\n- Quantity: ${grainQuantity} kg\n- Condition: ${grainCondition}\n- Estimated Cost: ${calculateTransaction().toLocaleString()} KES\n\nSMS will be sent to ${selectedNGO.phone} with your pickup request details.`);
      
      // Reset form
      setGrainQuantity('');
      setGrainCondition('');
      setSelectedNGO(null);
      
      // Navigate back to dashboard after successful request
      setTimeout(() => {
        setCurrentView('dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error sending pickup request:', error);
      await ttsService.speak('Error sending pickup request. Please try again.', 'en');
      alert('Error sending pickup request. Please try again.');
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="lg" className="flex items-center gap-2 h-12 px-4">
                {getThemeIcon()}
                <span className="hidden sm:inline">{getThemeLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setSpecificTheme('light')}
                className="flex items-center gap-2 p-3"
              >
                <Sun className="w-4 h-4" />
                Light Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSpecificTheme('dark')}
                className="flex items-center gap-2 p-3"
              >
                <Moon className="w-4 h-4" />
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSpecificTheme('colorblind')}
                className="flex items-center gap-2 p-3"
              >
                <Palette className="w-4 h-4" />
                Colorblind Friendly
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="lg" className="h-12 px-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
            </svg>
          </Button>
          
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm font-medium">0 pts</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm font-medium">Curious Scout</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="text-sm">
              <div className="font-medium">Aryan</div>
              <div className="text-gray-600">buyer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Upgrade Banner
  const UpgradeBanner = () => (
    <div className="bg-primary p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <span className="text-2xl">⭐</span>
          <span className="text-lg font-medium">Upgrade to Premium for advanced analytics and ad-free experience</span>
        </div>
        <Button variant="outline" size="lg" className="bg-white text-primary border-white hover:bg-gray-100 h-12 px-6">
          Upgrade Now
        </Button>
      </div>
    </div>
  );

  // Corn Quality Assessment View
  const CornQualityAssessment = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => setCurrentView('dashboard')} size="lg" className="p-3">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Corn Quality Assessment</h1>
          <p className="text-gray-600 text-lg">Step 1 of 3 - AI-Powered Quality Analysis</p>
        </div>
        <Button variant="ghost" size="lg" className="p-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
          </svg>
        </Button>
      </div>

      <div className="bg-gray-200 h-3 rounded-full mb-8">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-500" 
          style={{ width: scanProgress > 0 ? `${scanProgress}%` : '33%' }}
        ></div>
      </div>

      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Capture Corn Sample</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          {photo?.webPath ? (
            <div className="mb-8">
              <img 
                src={photo.webPath} 
                alt="Captured corn sample" 
                className="max-w-md mx-auto rounded-2xl shadow-lg"
              />
              <p className="text-green-600 font-medium mt-4 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Photo captured successfully!
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-16 mb-8">
              <Camera className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Take Photo of Corn Sample</h3>
              <p className="text-gray-600 text-lg mb-8">Position your camera over the corn kernels for AI analysis</p>
            </div>
          )}
          
          <div className="flex gap-6 justify-center">
            <Button 
              onClick={handleCameraCapture}
              disabled={cameraLoading}
              size="lg"
              className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 h-14 px-8 text-lg"
            >
              <Camera className="w-6 h-6" />
              {cameraLoading ? 'Opening Camera...' : 'Open Camera'}
            </Button>
            <Button 
              onClick={handleGallerySelect}
              disabled={cameraLoading}
              variant="outline" 
              size="lg"
              className="flex items-center gap-3 h-14 px-8 text-lg border-2"
            >
              <Upload className="w-6 h-6" />
              Upload Photo
            </Button>
          </div>

          {photo?.webPath && !showAssessmentQuestions && (
            <div className="mt-8">
              <Button 
                onClick={() => setShowAssessmentQuestions(true)}
                size="lg"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-lg"
              >
                Continue Assessment
              </Button>
            </div>
          )}

          {showAssessmentQuestions && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-semibold text-center mb-6">Quality Assessment Questions</h3>
              
              {/* Transport Condition */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  How would you rate the transport conditions?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Poor', 'Average', 'Excellent'].map((option) => (
                    <Button
                      key={option}
                      variant={transportCondition === option ? "default" : "outline"}
                      onClick={() => setTransportCondition(option)}
                      className="h-12"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Storage Condition */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  How would you rate the storage conditions?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Poor', 'Average', 'Excellent'].map((option) => (
                    <Button
                      key={option}
                      variant={storageCondition === option ? "default" : "outline"}
                      onClick={() => setStorageCondition(option)}
                      className="h-12"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              {transportCondition && storageCondition && (
                <div className="mt-6">
                  <Button 
                    onClick={generateFinalAssessment}
                    size="lg"
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg"
                    disabled={scanProgress > 0}
                  >
                    {scanProgress > 0 ? 'Analyzing...' : 'Generate Final Assessment'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {scanProgress > 0 && (
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
                <span className="text-lg font-medium text-blue-800">AI Analysis in Progress...</span>
              </div>
              <div className="bg-blue-200 h-3 rounded-full">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <p className="text-blue-700 mt-2">{scanProgress}% complete</p>
            </div>
          )}
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Main Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Corn Quality Assessment */}
        <Card 
          className="cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 hover:border-blue-300"
          onClick={() => setCurrentView('scan')}
        >
          <CardHeader className="text-center pb-8 pt-8">
            <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-2xl mb-3">Corn Quality Assessment</CardTitle>
            <p className="text-gray-600 text-lg">AI-powered quality analysis</p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button size="lg" className="w-full h-14 text-lg font-medium">
              Start Assessment
            </Button>
          </CardContent>
        </Card>

        {/* NGO Marketplace */}
        <Card 
          className="cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 hover:border-green-300"
          onClick={() => setCurrentView('ngo-marketplace')}
        >
          <CardHeader className="text-center pb-8 pt-8">
            <div className="w-24 h-24 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <RecycleIcon className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-2xl mb-3">NGO Marketplace</CardTitle>
            <p className="text-gray-600 text-lg">Contaminated grain disposal</p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button size="lg" className="w-full h-14 text-lg font-medium bg-green-500 hover:bg-green-600">
              Browse NGOs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-sm text-muted-foreground font-medium">Total Scans</div>
          </CardContent>
        </Card>
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground font-medium">Good Quality</div>
          </CardContent>
        </Card>
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground font-medium">NGO Requests</div>
          </CardContent>
        </Card>
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground font-medium">KES Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <CardTitle className="text-lg">Quality Guarantee</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-4">
              Our AI-powered system provides 95% accuracy in detecting aflatoxin contamination.
            </p>
            <Button variant="outline" className="w-full" onClick={handleLearnMore}>Learn More</Button>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <CardTitle className="text-lg">NGO Network</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-4">
              Connect with 50+ verified NGOs for safe disposal of contaminated grain.
            </p>
            <Button variant="outline" className="w-full" onClick={handleViewNetwork}>View Network</Button>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-4">
              Get real-time pricing and market trends for quality grain trading.
            </p>
            <Button variant="outline" className="w-full" onClick={handleViewTrends}>View Trends</Button>
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