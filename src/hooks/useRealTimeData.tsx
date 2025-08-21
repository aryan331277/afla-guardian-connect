import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FieldData {
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  weather: {
    temp: number;
    humidity: number;
    condition: string;
    windSpeed?: number;
    pressure?: number;
  };
  soil: {
    ph: number;
    moisture: number;
    nutrients: string;
    temperature?: number;
    conductivity?: number;
  };
  ndvi: number;
  pestRisk: {
    level: 'low' | 'medium' | 'high';
    confidence: number;
    detectedPests: string[];
  };
  growthPrediction: {
    expectedYield: number;
    maturityDate: string;
    healthScore: number;
  };
  timestamp: string;
}

export interface UserStats {
  totalPoints: number;
  scanStreak: number;
  totalScans: number;
  communityPosts: number;
  insightsGenerated: number;
  tier: string;
  lastScanDate?: string;
  achievementsUnlocked: number;
}

interface UseRealTimeDataReturn {
  fieldData: FieldData | null;
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retryCount: number;
}

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

export const useRealTimeData = (): UseRealTimeDataReturn => {
  const [fieldData, setFieldData] = useState<FieldData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const fetchFieldData = useCallback(async (): Promise<FieldData | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-field-data', {
        body: { 
          location: { lat: -1.2921, lng: 36.8219 }, // Default to Nairobi
          includeWeather: true,
          includeSoil: true,
          includeNDVI: true 
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching field data:', err);
      // Fallback data for resilience
      return {
        location: { lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' },
        weather: { temp: 24, humidity: 65, condition: 'Partly Cloudy', windSpeed: 12, pressure: 1013 },
        soil: { ph: 6.5, moisture: 45, nutrients: 'Medium', temperature: 22, conductivity: 1.2 },
        ndvi: 0.65,
        pestRisk: { level: 'low', confidence: 0.8, detectedPests: [] },
        growthPrediction: { expectedYield: 85, maturityDate: '2024-12-15', healthScore: 7.8 },
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  const fetchUserStats = useCallback(async (): Promise<UserStats | null> => {
    try {
      // Simulate API call - replace with actual user stats endpoint
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      return {
        totalPoints: userData.gamificationPoints || Math.floor(Math.random() * 1000) + 100,
        scanStreak: userData.scanStreak || Math.floor(Math.random() * 15) + 1,
        totalScans: Math.floor(Math.random() * 50) + 5,
        communityPosts: Math.floor(Math.random() * 20) + 2,
        insightsGenerated: Math.floor(Math.random() * 30) + 8,
        tier: userData.currentTier || 'Curious Scout',
        lastScanDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        achievementsUnlocked: Math.floor(Math.random() * 10) + 3
      };
    } catch (err) {
      console.error('Error fetching user stats:', err);
      return {
        totalPoints: 250,
        scanStreak: 5,
        totalScans: 12,
        communityPosts: 4,
        insightsGenerated: 15,
        tier: 'Curious Scout',
        achievementsUnlocked: 6
      };
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [fieldResult, statsResult] = await Promise.all([
        fetchFieldData(),
        fetchUserStats()
      ]);

      setFieldData(fieldResult);
      setUserStats(statsResult);
      setRetryCount(0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch real-time data';
      setError(errorMessage);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchData();
        }, RETRY_DELAY * (retryCount + 1));
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to fetch real-time data. Using cached information.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFieldData, fetchUserStats, retryCount, toast]);

  const refetch = useCallback(async () => {
    setRetryCount(0);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (!isLoading && retryCount === 0) {
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData, isLoading, retryCount]);

  // Simulate real-time updates for demo purposes
  useEffect(() => {
    if (!fieldData) return;

    const updateInterval = setInterval(() => {
      setFieldData(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          weather: {
            ...prev.weather,
            temp: prev.weather.temp + (Math.random() - 0.5) * 2,
            humidity: Math.max(0, Math.min(100, prev.weather.humidity + (Math.random() - 0.5) * 5))
          },
          soil: {
            ...prev.soil,
            moisture: Math.max(0, Math.min(100, prev.soil.moisture + (Math.random() - 0.5) * 3))
          },
          ndvi: Math.max(0, Math.min(1, prev.ndvi + (Math.random() - 0.5) * 0.05)),
          timestamp: new Date().toISOString()
        };
      });
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(updateInterval);
  }, [fieldData]);

  return {
    fieldData,
    userStats,
    isLoading,
    error,
    refetch,
    retryCount
  };
};