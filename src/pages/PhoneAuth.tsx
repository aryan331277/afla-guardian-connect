import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { db, User, UserRole, Language } from '@/lib/database';
import { t, I18nService } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { useToast } from '@/hooks/use-toast';

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phone}`,
      });
    }, 1500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get stored selections
      const role = localStorage.getItem('aflaguard-role') as UserRole || 'farmer';
      const language = localStorage.getItem('aflaguard-language') as Language || 'en';

      // Set language
      I18nService.setLanguage(language);

      // Create or update user
      const existingUser = await db.users.where('phone').equals(phone).first();
      
      let userId: number;
      if (existingUser) {
        userId = existingUser.id!;
        await db.users.update(userId, {
          role,
          language,
          lastSeen: new Date()
        });
      } else {
        userId = await db.users.add({
          phone,
          role,
          language,
          theme: 'light',
          hasUpgraded: false,
          createdAt: new Date(),
          lastSeen: new Date(),
          gamificationPoints: 0,
          scanStreak: 0,
          currentTier: 'Curious Scout',
          badges: []
        });
      }

      // Welcome message
      await ttsService.speak(
        `Welcome to AflaGuard! You are now logged in as a ${role}.`,
        language
      );

      // Navigate to appropriate dashboard
      navigate(`/${role}`);

    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, I18nService.getCurrentLanguage());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
            {step === 'phone' ? t('auth.phone', 'Enter Phone Number') : t('auth.otp', 'Enter Verification Code')}
            <button
              onClick={() => handleSpeak(step === 'phone' ? t('auth.phone') : t('auth.otp'))}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
              </svg>
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  className="mt-1 text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Code sent to {phone}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  {t('action.back', 'Back')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : t('auth.verify', 'Verify')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneAuth;