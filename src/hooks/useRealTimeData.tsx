import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FieldData {
  location: {
    lat: number;
    lng: number;
    address: string;
    elevation: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    uvIndex: number;
  };
  soil: {
    ph: string;
    moisture: number;
    organicMatter: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    nutrients: string;
    texture: string;
  };
  vegetation: {
    ndvi: string;
    biomass: number;
    chlorophyll: string;
    leafAreaIndex: string;
    stressLevel: string;
  };
  pests: {
    detected: boolean;
    types: string[];
    severity: string;
    treatmentRecommended: boolean;
  };
  growthPrediction: {
    yieldEstimate: number;
    harvestDate: string;
    growthStage: string;
    healthScore: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface UserStats {
  gamificationPoints: number;
  scanStreak: number;
  currentTier: string;
  totalScans: number;
  successfulScans: number;
  lastScanDate: string;
  achievements: string[];
}

export function useRealTimeData() {
  const [fieldData, setFieldData] = useState<FieldData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchFieldData = useCallback(async (lat = -1.2921, lng = 36.8219) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-field-data', {
        body: {
          lat,
          lng,
          parameters: ['weather', 'soil', 'vegetation', 'pests', 'growth']
        }
      });

      if (error) throw error;

      setFieldData(data);
      setLastUpdate(new Date());
      
      return data;
    } catch (error) {
      console.error('Error fetching field data:', error);
      toast({
        title: 'Data Fetch Error',
        description: 'Failed to fetch real-time field data',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUserStats = useCallback(async () => {
    try {
      // Simulate real-time user stats - in production this would be from database
      const savedStats = localStorage.getItem('userStats');
      let stats: UserStats;

      if (savedStats) {
        stats = JSON.parse(savedStats);
        // Add some real-time variation
        stats.gamificationPoints += Math.floor(Math.random() * 10);
        
        // Check if it's a new day for streak calculation
        const lastScan = new Date(stats.lastScanDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          stats.scanStreak += 1;
        } else if (daysDiff > 1) {
          stats.scanStreak = 0;
        }
      } else {
        stats = {
          gamificationPoints: Math.floor(Math.random() * 500) + 100,
          scanStreak: Math.floor(Math.random() * 10) + 1,
          currentTier: getTierFromPoints(Math.floor(Math.random() * 500) + 100),
          totalScans: Math.floor(Math.random() * 50) + 10,
          successfulScans: Math.floor(Math.random() * 45) + 8,
          lastScanDate: new Date().toISOString(),
          achievements: getRandomAchievements()
        };
      }

      setUserStats(stats);
      localStorage.setItem('userStats', JSON.stringify(stats));
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }, []);

  const getTierFromPoints = (points: number): string => {
    if (points < 100) return 'Curious Scout';
    if (points < 300) return 'Field Explorer';
    if (points < 600) return 'Crop Guardian';
    if (points < 1000) return 'Harvest Hero';
    return 'Farm Master';
  };

  const getRandomAchievements = (): string[] => {
    const achievements = [
      'First Scan Complete',
      'Weather Expert',
      'Soil Scientist',
      'Pest Detective',
      'Perfect Week',
      'Data Collector'
    ];
    return achievements.filter(() => Math.random() > 0.5);
  };

  const refreshData = useCallback(async () => {
    const [fieldResult, statsResult] = await Promise.all([
      fetchFieldData(),
      fetchUserStats()
    ]);
    
    if (fieldResult || statsResult) {
      toast({
        title: 'Data Refreshed',
        description: 'Latest information has been loaded',
      });
    }
  }, [fetchFieldData, fetchUserStats, toast]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Initial data load
  useEffect(() => {
    Promise.all([fetchFieldData(), fetchUserStats()]);
  }, [fetchFieldData, fetchUserStats]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (fieldData) {
        setFieldData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            weather: {
              ...prev.weather,
              temperature: prev.weather.temperature + (Math.random() - 0.5) * 2,
              humidity: Math.max(20, Math.min(90, prev.weather.humidity + (Math.random() - 0.5) * 5))
            },
            soil: {
              ...prev.soil,
              moisture: Math.max(10, Math.min(80, prev.soil.moisture + (Math.random() - 0.5) * 3))
            },
            timestamp: new Date().toISOString()
          };
        });
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fieldData]);

  return {
    fieldData,
    userStats,
    isLoading,
    lastUpdate,
    fetchFieldData,
    fetchUserStats,
    refreshData
  };
}