import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ttsService } from '@/lib/tts';
import { Volume2, Shield, Eye, Users, Database } from 'lucide-react';

const PrivacyAgreement = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const speakText = async (text: string) => {
    try {
      await ttsService.speak(text, 'en');
    } catch (error) {
      console.log('TTS not available:', error);
    }
  };

  const handleAccept = () => {
    if (!agreed) return;
    
    setLoading(true);
    // Store privacy acceptance
    localStorage.setItem('privacy-accepted', 'true');
    
    // Small delay for better UX
    setTimeout(() => {
      navigate('/auth');
    }, 500);
  };

  const handleDecline = () => {
    // Go back to role selection or exit app
    navigate('/role');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Privacy & Data Protection
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText("Privacy and Data Protection Agreement")}
              className="p-1 h-auto"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </CardTitle>
          <p className="text-muted-foreground">
            Your privacy matters. Please review our data practices.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <ScrollArea className="h-80 w-full border rounded-md p-4">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">What We Collect</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Your name and phone number for account creation</li>
                    <li>• Crop images you choose to scan for disease detection</li>
                    <li>• Usage data to improve our services</li>
                    <li>• Location data (optional) for localized recommendations</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">How We Use Your Data</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Provide agricultural disease detection services</li>
                    <li>• Send personalized farming recommendations</li>
                    <li>• Improve our AI models and accuracy</li>
                    <li>• Communicate important updates about your crops</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">Data Protection</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• All data is encrypted and securely stored</li>
                    <li>• We never sell your personal information</li>
                    <li>• You can delete your account and data anytime</li>
                    <li>• Only authorized staff can access your data</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">Data Sharing</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Anonymous data may be shared with agricultural researchers</li>
                    <li>• Government agencies may access aggregated crop health data</li>
                    <li>• We partner with agricultural institutions to improve services</li>
                    <li>• No personal identifiers are included in shared data</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-primary mb-2">Your Rights</h3>
                <p className="text-muted-foreground text-xs">
                  You have the right to access, modify, or delete your personal data. 
                  You can contact us anytime to exercise these rights. By continuing, 
                  you acknowledge that you have read and understood this privacy policy.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
            <Checkbox
              id="privacy-agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <div className="space-y-1">
              <label
                htmlFor="privacy-agreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                I agree to the privacy policy and data usage terms
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText("I agree to the privacy policy and data usage terms")}
                  className="p-1 h-auto"
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              </label>
              <p className="text-xs text-muted-foreground">
                Required to use AflaGuard services
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!agreed || loading}
              className="flex-1"
            >
              {loading ? 'Proceeding...' : 'Accept & Continue'}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By accepting, you can proceed to create your AflaGuard account
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyAgreement;