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
      
      // Get selected role from localStorage
      const selectedRole = localStorage.getItem('aflaguard-role') || 'farmer';
      
      const { user, error } = await authService.register(
        signupName.trim(), 
        signupPhone.trim(), 
        signupPassword,
        selectedRole
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 glass backdrop-blur-xl border-0 shadow-2xl animate-scale-in">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg animate-glow">
            <div className="text-3xl font-bold text-white">AG</div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient mb-2">
            AflaGuard
          </CardTitle>
          <p className="text-lg text-muted-foreground font-medium">
            Your Smart Agricultural Assistant
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12 rounded-xl">
              <TabsTrigger 
                value="login" 
                onClick={resetForm}
                className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                onClick={resetForm}
                className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
              >
                Create Account
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-6 mt-8 animate-slide-up">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Full Name
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText("Enter your full name")}
                      className="p-1 h-auto hover:bg-primary/10 rounded-full"
                    >
                      <Volume2 className="h-3 w-3 text-primary" />
                    </Button>
                  </Label>
                  <Input
                    id="login-name"
                    type="text"
                    placeholder="John Doe"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-background/50 border-2 border-border/50 focus:border-primary focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Password
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText("Enter your password")}
                      className="p-1 h-auto hover:bg-primary/10 rounded-full"
                    >
                      <Volume2 className="h-3 w-3 text-primary" />
                    </Button>
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-background/50 border-2 border-border/50 focus:border-primary focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 bg-gradient-primary hover:shadow-lg hover:scale-[1.02] transition-all rounded-xl text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6 mt-8 animate-slide-up">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Full Name
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText("Enter your full name")}
                      className="p-1 h-auto hover:bg-primary/10 rounded-full"
                    >
                      <Volume2 className="h-3 w-3 text-primary" />
                    </Button>
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-background/50 border-2 border-border/50 focus:border-primary focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Phone Number
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText("Enter your phone number")}
                      className="p-1 h-auto hover:bg-primary/10 rounded-full"
                    >
                      <Volume2 className="h-3 w-3 text-primary" />
                    </Button>
                  </Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-background/50 border-2 border-border/50 focus:border-primary focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Create Password
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText("Create a secure password")}
                      className="p-1 h-auto hover:bg-primary/10 rounded-full"
                    >
                      <Volume2 className="h-3 w-3 text-primary" />
                    </Button>
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-background/50 border-2 border-border/50 focus:border-primary focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleDirectSignup}
                disabled={loading}
                className="w-full h-12 bg-gradient-primary hover:shadow-lg hover:scale-[1.02] transition-all rounded-xl text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/role-selection')}
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
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