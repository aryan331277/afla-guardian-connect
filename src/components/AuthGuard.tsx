import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, FarmerUser } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const AuthGuard = ({ children, requiredRole, redirectTo = '/phone-auth' }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.checkSession();
      
      if (!currentUser) {
        navigate(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole && currentUser.role !== requiredRole) {
        console.log(`User role ${currentUser.role} doesn't match required role ${requiredRole}`);
        navigate('/phone-auth');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

export default AuthGuard;