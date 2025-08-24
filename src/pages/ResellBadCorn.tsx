import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  Building2,
  MessageSquare,
  Navigation,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';

interface NGO {
  id: string;
  name: string;
  phone: string;
  distance: number;
  specialization: string;
  rating: number;
  responseTime: string;
}

const ResellBadCorn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyNGOs, setNearbyNGOs] = useState<NGO[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          findNearbyNGOs(coords);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          // Use mock Nairobi location for demo
          const mockLocation = { lat: -1.2921, lng: 36.8219 };
          setLocation(mockLocation);
          findNearbyNGOs(mockLocation);
          
          toast({
            title: "Location Access",
            description: "Using approximate location. For better results, please enable GPS.",
            variant: "default",
          });
        }
      );
    }
  };

  const findNearbyNGOs = (coords: { lat: number; lng: number }) => {
    // Mock NGO data - in real implementation, this would query a database
    const mockNGOs: NGO[] = [
      {
        id: '1',
        name: 'Kenya Agricultural NGO Network',
        phone: '+254712345001',
        distance: 2.3,
        specialization: 'Crop waste management',
        rating: 4.8,
        responseTime: '2-4 hours'
      },
      {
        id: '2',
        name: 'Farm to Fork Initiative',
        phone: '+254712345002',
        distance: 5.7,
        specialization: 'Food safety & disposal',
        rating: 4.6,
        responseTime: '4-6 hours'
      },
      {
        id: '3',
        name: 'Sustainable Agriculture Foundation',
        phone: '+254712345003',
        distance: 8.1,
        specialization: 'Contaminated crop handling',
        rating: 4.9,
        responseTime: '1-2 hours'
      },
      {
        id: '4',
        name: 'Green Harvest Recovery',
        phone: '+254712345004',
        distance: 12.4,
        specialization: 'Agricultural waste recycling',
        rating: 4.4,
        responseTime: '6-8 hours'
      }
    ];

    // Sort by distance
    const sortedNGOs = mockNGOs.sort((a, b) => a.distance - b.distance);
    setNearbyNGOs(sortedNGOs);
  };

  const sendPickupRequest = async () => {
    if (!selectedNGO || !quantity || !contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      
      // Mock SMS sending - in real implementation, integrate with SMS gateway
      const smsMessage = `NEW PICKUP REQUEST
From: ${currentUser?.full_name || 'Buyer'}
Phone: ${contactNumber}
Quantity: ${quantity}
Location: ${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}
Description: ${description}
Requested via AflaGuard Pro`;

      console.log('Sending SMS to NGO:', selectedNGO.phone);
      console.log('Message:', smsMessage);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setRequestSent(true);
      
      toast({
        title: "Request Sent Successfully!",
        description: `${selectedNGO.name} has been notified. Expected response: ${selectedNGO.responseTime}`,
      });

      // Save pickup request to database (would implement in real app)
      
    } catch (error) {
      console.error('Error sending pickup request:', error);
      toast({
        title: "Request Failed",
        description: "Failed to send pickup request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (requestSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/buyer')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Pickup Request</h1>
          </div>

          <Card className="text-center p-8">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Request Sent Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              {selectedNGO?.name} has been notified of your pickup request.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">NGO:</span>
                  <div className="font-medium">{selectedNGO?.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Response:</span>
                  <div className="font-medium">{selectedNGO?.responseTime}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance:</span>
                  <div className="font-medium">{selectedNGO?.distance} km</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact:</span>
                  <div className="font-medium">{selectedNGO?.phone}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setRequestSent(false);
                  setSelectedNGO(null);
                  setQuantity('');
                  setDescription('');
                  setContactNumber('');
                }}
                variant="outline" 
                className="w-full"
              >
                Send Another Request
              </Button>
              <Button onClick={() => navigate('/buyer')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/buyer')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">NGO Partnership Program</h1>
        </div>

        <div className="space-y-6">
          {/* Location Status */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Navigation className={`w-5 h-5 ${gettingLocation ? 'animate-spin text-blue-500' : 'text-blue-600'}`} />
                <div>
                  <div className="font-semibold text-blue-800">Location Status</div>
                  <div className="text-sm text-blue-600">
                    {gettingLocation ? 'Getting your location...' : 
                     location ? `Found ${nearbyNGOs.length} nearby NGO partners` : 'Location not available'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NGO Selection */}
          {nearbyNGOs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Available NGO Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearbyNGOs.map((ngo) => (
                  <div
                    key={ngo.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedNGO?.id === ngo.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedNGO(ngo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ngo.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {ngo.rating}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ngo.specialization}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {ngo.distance} km away
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ngo.responseTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pickup Request Form */}
          {selectedNGO && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Pickup Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity (kg or bags)</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 50 kg or 10 bags"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contact">Your Contact Number</Label>
                  <Input
                    id="contact"
                    placeholder="+254712345678"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Additional Details (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Contamination level, storage conditions, special handling requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Selected NGO Partner</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>{selectedNGO.name}</strong></div>
                    <div>Distance: {selectedNGO.distance} km</div>
                    <div>Response time: {selectedNGO.responseTime}</div>
                    <div>Specialization: {selectedNGO.specialization}</div>
                  </div>
                </div>

                <Button 
                  onClick={sendPickupRequest}
                  disabled={isLoading || !quantity || !contactNumber}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Send className="w-4 h-4 mr-2 animate-pulse" />
                      Sending SMS Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Pickup Request via SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResellBadCorn;