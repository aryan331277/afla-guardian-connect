import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera } from 'lucide-react';

const BuyerScan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    // Mock scan process
    setTimeout(() => {
      setIsScanning(false);
      // Show results
    }, 3000);
  };

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
              Aflatoxin Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="w-64 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center">
              {isScanning ? (
                <div className="animate-pulse">Scanning...</div>
              ) : (
                <Camera className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
            
            <Button onClick={startScan} disabled={isScanning} size="lg" className="w-full">
              {isScanning ? 'Analyzing...' : 'Start Camera Scan'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerScan;