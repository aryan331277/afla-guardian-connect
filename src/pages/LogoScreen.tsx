import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const LogoScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate to privacy after 3 seconds
    const timer = setTimeout(() => {
      navigate('/privacy-agreement');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate('/privacy-agreement');
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