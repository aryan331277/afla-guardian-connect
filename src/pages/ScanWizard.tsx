import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { ArrowLeft, MapPin, Thermometer, Droplets, Leaf } from 'lucide-react';

const ScanWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [scanData, setScanData] = useState({
    // Auto-filled features
    gpsLat: 0,
    gpsLng: 0,
    soilMoistureDeficit: 0,
    highDayTemp: 0,
    highHumidity: 0,
    erraticRainfall: 0,
    soilTexture: 0,
    ndvi: 0,
    // User selections
    cropGenotype: 'medium',
    fertilisation: 'medium',
    cropResidue: 'medium',
    lackIrrigation: 'medium',
    insects: 'medium',
    soilPH: 'medium'
  });

  const handleSubmit = () => {
    // Process scan and show results
    navigate('/farmer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/farmer')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('scan.wizard.title', 'Field Scan Analysis')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              15-Feature Analysis Wizard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>GPS: Auto-detected</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4 text-accent" />
                <span>Weather: Auto-filled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="w-4 h-4 text-info" />
                <span>Soil: Auto-analyzed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="w-4 h-4 text-success" />
                <span>NDVI: Satellite data</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Manual Assessment Required:</h3>
              
              {['cropGenotype', 'fertilisation', 'cropResidue', 'lackIrrigation', 'insects', 'soilPH'].map((field) => (
                <div key={field}>
                  <Label className="mb-2 block">{t(`crop.${field.toLowerCase()}`, field)}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['very-less', 'less', 'medium', 'high', 'very-high'].map((level) => (
                      <Button
                        key={level}
                        variant={scanData[field as keyof typeof scanData] === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScanData({...scanData, [field]: level})}
                      >
                        {level.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Complete Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanWizard;