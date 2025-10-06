import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authService, FarmerUser } from '@/lib/auth';
import { ttsService } from '@/lib/tts';
import { Volume2, Wheat } from 'lucide-react';

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
    // Check if privacy was accepted
    const privacyAccepted = localStorage.getItem('privacy-accepted');
    if (!privacyAccepted) {
      navigate('/privacy-agreement');
      return;
    }

    // Check for existing session on mount
    const checkAuth = async () => {
      const currentUser = await authService.checkSession();
      if (currentUser) {
        setUser(currentUser);
        const role = currentUser.role || 'farmer';
        navigate(`/${role}`);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const speakText = async (text: string) => {
    try {
      await ttsService.speak(text, 'en');
    } catch (error) {
      console.log('TTS not available:', error);
    }
  };

  const handleLogin = async () => {
    if (!loginName.trim() || !loginPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both name and password",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with name:', loginName);
      
      const { session, error } = await authService.login(loginName.trim(), loginPassword);

      if (error) {
        console.error('Login Error:', error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error,
        });
        return;
      }

      if (session?.user) {
        console.log('Login successful:', session.user);
        setUser(session.user);
        toast({
          title: "Welcome Back!",
          description: `Welcome ${session.user.full_name}!`,
        });
        
        const role = session.user.role || 'farmer';
        navigate(`/${role}`);
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSignup = async () => {
    if (!signupName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your full name",
      });
      return;
    }

    if (!signupPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your phone number",
      });
      return;
    }

    if (!signupPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please set a password",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating account for:', signupName);
      
      const { user, error } = await authService.register(
        signupName.trim(), 
        signupPhone.trim(), 
        signupPassword
      );

      if (error) {
        console.error('Signup Error:', error);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error,
        });
        return;
      }

      if (user) {
        console.log('Signup successful:', user);
        toast({
          title: "Success!",
          description: "Account created successfully! You can now login.",
        });
        
        // Switch to login tab and prefill name
        setLoginName(signupName.trim());
        setLoginPassword('');
      }
      
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLoginName('');
    setLoginPassword('');
    setSignupName('');
    setSignupPhone('');
    setSignupPassword('');
  };

  const handleContinue = () => {
    // Skip authentication and go directly to the selected role dashboard
    const role = localStorage.getItem('verdan-role') || 'farmer';
    
    switch (role) {
      case 'farmer':
        navigate('/farmer');
        break;
      case 'buyer':
        navigate('/buyer');
        break;
      case 'government':
        navigate('/government');
        break;
      default:
        navigate('/farmer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wheat className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome to Verdan
          </h1>
          
          <p className="text-muted-foreground text-lg">
            Professional Agricultural Intelligence Platform
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-foreground">
              Ready to Get Started!
            </CardTitle>
            <p className="text-muted-foreground">
              Click below to access your dashboard
            </p>
          </CardHeader>
          
          <CardContent className="text-center">
            <Button 
              onClick={handleContinue}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
              size="lg"
            >
              Access Dashboard
            </Button>
            
            <div className="mt-8 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/role-selection')}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to Role Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhoneAuth;