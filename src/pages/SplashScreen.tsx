import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Fade in logo
    setFadeIn(true);

    // Check if user exists after 2 seconds
    const timer = setTimeout(async () => {
      try {
        const user = await authService.checkSession();
        if (user) {
          // User exists, go to their dashboard
          navigate(`/${user.role}`);
        } else {
          // New user, go to language selection
          navigate('/language');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/language');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className={`text-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-primary rounded-full flex items-center justify-center shadow-2xl">
            <div className="text-primary-foreground text-4xl font-bold">AG</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">AflaGuard</h1>
        <p className="text-lg text-muted-foreground">Protecting Your Harvest</p>
        
        {/* Loading indicator */}
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;