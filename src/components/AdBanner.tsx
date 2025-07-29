import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/database';
import { X } from 'lucide-react';

const AdBanner = () => {
  const [showAd, setShowAd] = useState(true);
  const [hasUpgraded, setHasUpgraded] = useState(false);

  useEffect(() => {
    checkUpgradeStatus();
  }, []);

  const checkUpgradeStatus = async () => {
    try {
      const user = await DatabaseService.getCurrentUser();
      if (user?.hasUpgraded) {
        setHasUpgraded(true);
        setShowAd(false);
      }
    } catch (error) {
      console.error('Error checking upgrade status:', error);
    }
  };

  if (!showAd || hasUpgraded) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 ad-banner bg-gradient-to-r from-accent/90 to-primary/90 text-white">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex-1 text-center">
          <p className="text-sm font-medium">
            🌾 Upgrade to Premium - Remove ads, get expert support & 20% IoT discount!
          </p>
        </div>
        <button
          onClick={() => setShowAd(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close advertisement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdBanner;