import { useState, useEffect, useCallback } from 'react';
import { geolocationService, LocationData, LocationError } from '@/services/geolocation.service';
import { apiService, WeatherData, NDVIData, SoilMoistureData } from '@/services/api.service';

interface LocationDataState {
  location: LocationData | null;
  weather: WeatherData | null;
  ndvi: NDVIData | null;
  soilMoisture: SoilMoistureData | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: PermissionState | null;
  retryCount: number;
}

export const useLocationData = () => {
  const [state, setState] = useState<LocationDataState>({
    location: null,
    weather: null,
    ndvi: null,
    soilMoisture: null,
    isLoading: false,
    error: null,
    permissionStatus: null,
    retryCount: 0
  });

  const fetchLocationAndData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check permission first
      const permission = await geolocationService.requestPermission();
      setState(prev => ({ ...prev, permissionStatus: permission }));

      if (permission === 'denied') {
        throw new Error('Location permission denied. Please enable location access to use this feature.');
      }

      // Get current location
      const location = await geolocationService.getCurrentLocation();
      setState(prev => ({ ...prev, location }));

      // Fetch all data in parallel
      const [weather, ndvi, soilMoisture] = await Promise.allSettled([
        apiService.fetchWeatherData(location),
        apiService.fetchNDVIData(location),
        apiService.fetchSoilMoistureData(location)
      ]);

      setState(prev => ({
        ...prev,
        weather: weather.status === 'fulfilled' ? weather.value : null,
        ndvi: ndvi.status === 'fulfilled' ? ndvi.value : null,
        soilMoisture: soilMoisture.status === 'fulfilled' ? soilMoisture.value : null,
        isLoading: false,
        retryCount: 0
      }));

      // Log any failed requests
      if (weather.status === 'rejected') console.error('Weather fetch failed:', weather.reason);
      if (ndvi.status === 'rejected') console.error('NDVI fetch failed:', ndvi.reason);
      if (soilMoisture.status === 'rejected') console.error('Soil moisture fetch failed:', soilMoisture.reason);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        retryCount: prev.retryCount + 1
      }));
    }
  }, []);

  const retry = useCallback(() => {
    if (state.retryCount < 3) {
      fetchLocationAndData();
    }
  }, [fetchLocationAndData, state.retryCount]);

  const clearCache = useCallback(() => {
    geolocationService.clearCache();
    setState({
      location: null,
      weather: null,
      ndvi: null,
      soilMoisture: null,
      isLoading: false,
      error: null,
      permissionStatus: null,
      retryCount: 0
    });
  }, []);

  const refresh = useCallback(() => {
    clearCache();
    fetchLocationAndData();
  }, [clearCache, fetchLocationAndData]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchLocationAndData();
  }, [fetchLocationAndData]);

  return {
    ...state,
    retry,
    refresh,
    clearCache,
    canRetry: state.retryCount < 3,
    hasData: Boolean(state.location && (state.weather || state.ndvi || state.soilMoisture))
  };
};