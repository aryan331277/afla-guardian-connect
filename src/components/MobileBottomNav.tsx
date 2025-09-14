import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Scan, 
  BarChart3, 
  MessageCircle, 
  User,
  Building,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/farmer',
    roles: ['farmer']
  },
  {
    id: 'scan',
    label: 'Scan',
    icon: Scan,
    path: '/scan',
    roles: ['farmer']
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: BarChart3,
    path: '/insights-history',
    roles: ['farmer']
  },
  {
    id: 'community',
    label: 'Community',
    icon: MessageCircle,
    path: '/community',
    roles: ['farmer', 'buyer']
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    roles: ['farmer']
  },
  // Buyer navigation
  {
    id: 'buyer-home',
    label: 'Home',
    icon: Building,
    path: '/buyer',
    roles: ['buyer']
  },
  {
    id: 'buyer-scan',
    label: 'Assess',
    icon: Scan,
    path: '/buyer-scan',
    roles: ['buyer']
  },
  // Government navigation
  {
    id: 'gov-home',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/government',
    roles: ['government']
  },
  {
    id: 'gov-community',
    label: 'Community',
    icon: Users,
    path: '/community',
    roles: ['government']
  }
];

interface MobileBottomNavProps {
  userRole?: string;
}

export const MobileBottomNav = ({ userRole = 'farmer' }: MobileBottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 h-auto min-w-0 flex-1",
                active && "text-primary"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                active && "text-primary"
              )} />
              <span className={cn(
                "text-xs truncate",
                active && "text-primary font-medium"
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};