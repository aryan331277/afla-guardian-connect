import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

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

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both email and password",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', loginEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });

      if (error) {
        console.error('Login Error:', error);
        throw error;
      }

      console.log('Login successful:', data);
      toast({
        title: "Success",
        description: "Successfully logged in!",
      });
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || 'Login failed. Please check your credentials.',
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

    if (!signupEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
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
      console.log('Creating account with email:', signupEmail.trim());
      
      const userMetadata: any = {
        full_name: signupName.trim()
      };
      
      // Only add phone if provided
      if (signupPhone.trim()) {
        const formattedPhone = signupPhone.startsWith('+') ? signupPhone : `+254${signupPhone.replace(/^0/, '')}`;
        userMetadata.phone_number = formattedPhone;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userMetadata
        }
      });

      if (error) {
        console.error('Signup Error:', error);
        throw error;
      }

      console.log('Signup successful:', data);
      toast({
        title: "Success",
        description: "Account created successfully! You can now login.",
      });
      
      // Switch to login tab and prefill email
      setLoginEmail(signupEmail.trim());
      setLoginPassword('');
      
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || 'Account creation failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };




  const resetForm = () => {
    setOtpSent(false);
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
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
                <Label htmlFor="login-email">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
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
              
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={() => toast({
                    title: "Info",
                    description: "Forgot password feature coming soon!",
                  })}
                >
                  Forgot Password?
                </Button>
              </div>
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
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
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
                <Label htmlFor="signup-password">Set Password</Label>
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