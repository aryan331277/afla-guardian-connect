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
    soilPH: 'neutral'
  });

  const handleSubmit = () => {
    // Simulate comprehensive analysis with detailed recommendations
    const analysisResults = generateAnalysis(scanData);
    
    // Store detailed scan results
    localStorage.setItem('lastScanResult', JSON.stringify({
      ...analysisResults,
      timestamp: new Date().toISOString(),
      scanData: scanData
    }));
    
    // Navigate to results page
    navigate('/scan-results');
  };

  const generateAnalysis = (data: typeof scanData) => {
    let riskScore = 0;
    const recommendations = [];
    const warnings = [];
    
    // Crop genotype analysis
    if (data.cropGenotype === 'very-high') {
      riskScore += 2;
      recommendations.push("Use resistant maize varieties like H6213 or DK8053");
    } else if (data.cropGenotype === 'high') {
      riskScore += 1;
      recommendations.push("Consider upgrading to more resistant varieties next season");
    }
    
    // Fertilization analysis  
    if (data.fertilisation === 'very-less') {
      riskScore += 2;
      recommendations.push("Apply NPK 17:17:17 at 50kg/acre during planting");
      warnings.push("Nutrient deficiency increases aflatoxin risk");
    }
    
    // Irrigation analysis
    if (data.lackIrrigation === 'very-high') {
      riskScore += 3;
      recommendations.push("Install drip irrigation system - reduces drought stress");
      recommendations.push("Mulch around plants to retain soil moisture");
      warnings.push("Water stress is the #1 aflatoxin risk factor");
    }
    
    // Insect analysis
    if (data.insects === 'very-high') {
      riskScore += 2;
      recommendations.push("Apply Karate 2.5EC immediately - target stem borers");
      recommendations.push("Set up pheromone traps for early detection");
      warnings.push("Insect damage creates entry points for aflatoxin-producing fungi");
    }
    
    // pH analysis
    if (data.soilPH === 'acidic') {
      riskScore += 1;
      recommendations.push("Apply agricultural lime at 2 tons/acre");
      recommendations.push("Test soil pH again after 3 months");
    } else if (data.soilPH === 'basic') {
      recommendations.push("Add organic matter to buffer high pH");
    }
    
    // Determine risk level
    let riskLevel, riskColor;
    if (riskScore >= 6) {
      riskLevel = "Critical Risk";
      riskColor = "text-red-600";
      warnings.push("Immediate action required - high probability of aflatoxin contamination");
    } else if (riskScore >= 4) {
      riskLevel = "High Risk"; 
      riskColor = "text-orange-600";
    } else if (riskScore >= 2) {
      riskLevel = "Medium Risk";
      riskColor = "text-yellow-600";
    } else {
      riskLevel = "Low Risk";
      riskColor = "text-green-600";
    }
    
    // Add general recommendations
    recommendations.push("Harvest when moisture content is below 25%");
    recommendations.push("Dry maize to 14% moisture within 48 hours");
    recommendations.push("Store in clean, dry containers with proper ventilation");
    
    return {
      riskLevel,
      riskColor,
      riskScore,
      recommendations,
      warnings,
      nextSteps: [
        "Monitor field weekly for pest activity",
        "Check soil moisture every 3 days", 
        "Apply fungicide if rainfall exceeds 100mm/week",
        "Plan harvest timing based on weather forecast"
      ]
    };
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
              
              {['cropGenotype', 'fertilisation', 'cropResidue', 'lackIrrigation', 'insects'].map((field) => (
                <div key={field}>
                  <Label className="mb-2 block">{t(`crop.${field.toLowerCase()}`, field)}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['very-less', 'less', 'medium', 'high', 'very-high'].map((level) => (
                      <Button
                        key={level}
                        variant={scanData[field as keyof typeof scanData] === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          console.log(`Setting ${field} to ${level}`);
                          setScanData({...scanData, [field]: level});
                        }}
                      >
                        {level.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Special pH field with acidic/basic/neutral */}
              <div>
                <Label className="mb-2 block">{t('crop.soil.ph', 'Soil pH Level')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['acidic', 'neutral', 'basic'].map((level) => (
                    <Button
                      key={level}
                      variant={scanData.soilPH === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        console.log(`Setting pH to ${level}`);
                        setScanData({...scanData, soilPH: level});
                      }}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
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