import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const LogoScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate to language selection after 3 seconds
    const timer = setTimeout(() => {
      navigate('/language');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate('/language');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center p-8 animate-fade-in">
        <div className="space-y-6">
          {/* Logo */}
          <div className="animate-bounce-in">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-4xl font-bold text-white">AG</span>
            </div>
          </div>

          {/* App Name */}
          <div className="space-y-2 animate-slide-in">
            <h1 className="text-4xl font-bold text-primary animate-typing">
              AflaGuard
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in">
              Agricultural Protection Assistant
            </p>
          </div>

          {/* Data Privacy Message */}
          <div className="space-y-3 animate-fade-in">
            <div className="bg-card border border-border rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔒</span>
                <h3 className="text-sm font-semibold text-card-foreground">Your Privacy Matters</h3>
              </div>
              <p className="text-xs text-card-foreground leading-relaxed">
                We protect your agricultural data with enterprise-grade security. 
                Your crop information and farm data remain confidential and are never shared without your consent.
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-3 animate-fade-in">
            <p className="text-lg text-accent font-medium">
              Protecting Farmers, Empowering Agriculture
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <span>🌱</span>
              <span>Smart Detection</span>
              <span>•</span>
              <span>🛡️</span>
              <span>Crop Protection</span>
              <span>•</span>
              <span>📱</span>
              <span>Easy to Use</span>
            </div>
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline animate-fade-in"
          >
            Skip →
          </button>
        </div>
      </Card>
    </div>
  );
};

export default LogoScreen;