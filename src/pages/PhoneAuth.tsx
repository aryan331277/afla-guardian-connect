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
import { Volume2 } from 'lucide-react';

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
                <div className="flex items-center gap-2">
                  <Label htmlFor="login-name">Name</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText("Enter your name")}
                    className="p-1 h-auto"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="login-name"
                  type="text"
                  placeholder="Enter your name"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText("Enter your password")}
                    className="p-1 h-auto"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full animate-scale-up hover:animate-wiggle"
                size="lg"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText("Enter your full name")}
                    className="p-1 h-auto"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText("Enter your phone number")}
                    className="p-1 h-auto"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+254712345678 or 0712345678"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="signup-password">Set Password</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText("Create a secure password")}
                    className="p-1 h-auto"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a secure password (min 6 characters)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              <Button 
                onClick={handleDirectSignup}
                disabled={loading}
                className="w-full animate-scale-up hover:animate-wiggle"
                size="lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
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