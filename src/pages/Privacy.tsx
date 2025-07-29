import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Privacy & Security</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Data Privacy Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AflaGuard collects agricultural data to provide personalized recommendations 
              and improve farming outcomes. Your data helps us enhance the AI model and 
              provide better insights to the farming community.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">We collect:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• GPS location for soil and weather data</li>
                <li>• Crop scanning results and images</li>
                <li>• Farming practices and techniques</li>
                <li>• Anonymous usage statistics</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Your data is:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Encrypted and stored securely</li>
                <li>• Used to improve AI recommendations</li>
                <li>• Never sold to third parties</li>
                <li>• Anonymized for research purposes</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox 
                id="consent" 
                checked={consent}
                onCheckedChange={(checked) => setConsent(!!checked)}
              />
              <label htmlFor="consent" className="text-sm">
                I consent to data collection for agricultural insights and app improvement.
              </label>
            </div>

            <Button 
              className="w-full" 
              disabled={!consent}
              onClick={() => navigate(-1)}
            >
              Accept & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;