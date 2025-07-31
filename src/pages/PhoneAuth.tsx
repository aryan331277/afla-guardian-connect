import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';

const PhoneAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupOtp, setSignupOtp] = useState('');

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users based on their role
        if (session?.user) {
          const role = localStorage.getItem('aflaguard-role') || 'farmer';
          navigate(`/${role}`);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = localStorage.getItem('aflaguard-role') || 'farmer';
        navigate(`/${role}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSendOTP = async (phone: string, isSignup: boolean = false) => {
    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      // Format phone number (ensure it starts with +)
      const formattedPhone = phone.startsWith('+') ? phone : `+254${phone.replace(/^0/, '')}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: isSignup ? { full_name: signupName } : undefined
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (phone: string, otp: string) => {
    if (!phone.trim() || !otp.trim()) {
      toast.error('Please enter both phone number and OTP');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+254${phone.replace(/^0/, '')}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast.success('Successfully logged in!');
      // Navigation will be handled by the auth state change listener
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!otpSent) {
      handleSendOTP(loginPhone);
    } else {
      handleVerifyOTP(loginPhone, loginOtp);
    }
  };

  const handleSignup = () => {
    if (!signupName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    
    if (!otpSent) {
      handleSendOTP(signupPhone, true);
    } else {
      handleVerifyOTP(signupPhone, signupOtp);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setLoginPhone('');
    setLoginOtp('');
    setSignupName('');
    setSignupPhone('');
    setSignupOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-bounce-in hover-scale hover-glow">
        <CardHeader className="text-center animate-slide-in">
          <CardTitle className="text-2xl text-primary animate-pulse">
            Welcome to AflaGuard
          </CardTitle>
          <p className="text-muted-foreground">
            Your Agricultural Protection Assistant
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 animate-scale-up">
              <TabsTrigger value="login" onClick={resetForm}>Login</TabsTrigger>
              <TabsTrigger value="signup" onClick={resetForm}>Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone Number</Label>
                <Input
                  id="login-phone"
                  type="tel"
                  placeholder="+254712345678 or 0712345678"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  disabled={loading || otpSent}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              {otpSent && (
                <div className="space-y-2 animate-slide-in">
                  <Label htmlFor="login-otp">Enter OTP</Label>
                  <Input
                    id="login-otp"
                    type="text"
                    placeholder="123456"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                    className="transition-all duration-200 hover:border-primary/50"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full animate-scale-up hover:animate-wiggle"
                size="lg"
              >
                {loading ? 'Processing...' : otpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
              
              {otpSent && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOtpSent(false);
                    setLoginOtp('');
                  }}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={loading || otpSent}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+254712345678 or 0712345678"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  disabled={loading || otpSent}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              {otpSent && (
                <div className="space-y-2 animate-slide-in">
                  <Label htmlFor="signup-otp">Enter OTP</Label>
                  <Input
                    id="signup-otp"
                    type="text"
                    placeholder="123456"
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                    className="transition-all duration-200 hover:border-primary/50"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleSignup}
                disabled={loading}
                className="w-full animate-scale-up hover:animate-wiggle"
                size="lg"
              >
                {loading ? 'Processing...' : otpSent ? 'Verify OTP & Sign Up' : 'Send OTP'}
              </Button>
              
              {otpSent && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOtpSent(false);
                    setSignupOtp('');
                  }}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/role')}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Back to Role Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneAuth;