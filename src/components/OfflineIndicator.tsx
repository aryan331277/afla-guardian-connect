import { useOffline } from '@/hooks/useOffline';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOffline, lastOnline } = useOffline();

  if (!isOffline) return null;

  return (
    <Alert className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <WifiOff className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        You're currently offline. Some features may be limited. Data will sync when connection is restored.
        {lastOnline && (
          <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Last online: {lastOnline.toLocaleTimeString()}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export const OnlineStatusBadge = () => {
  const { isOffline } = useOffline();

  return (
    <Badge 
      variant={isOffline ? "destructive" : "secondary"}
      className="flex items-center gap-1"
    >
      {isOffline ? (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3" />
          Online
        </>
      )}
    </Badge>
  );
};