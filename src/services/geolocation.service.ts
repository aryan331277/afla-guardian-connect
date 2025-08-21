export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class GeolocationService {
  private static instance: GeolocationService;
  private cachedLocation: LocationData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      // Check if we have a recent cached location
      if (this.cachedLocation && Date.now() - this.cachedLocation.timestamp < this.CACHE_DURATION) {
        resolve(this.cachedLocation);
        return;
      }

      if (!navigator.geolocation) {
        reject({ code: 0, message: 'Geolocation is not supported by this browser' });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          this.cachedLocation = locationData;
          resolve(locationData);
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code)
          };
          reject(locationError);
        },
        options
      );
    });
  }

  async requestPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      throw new Error('Permissions API not supported');
    }

    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location information unavailable';
      case 3:
        return 'Location request timeout';
      default:
        return 'Unknown location error';
    }
  }

  // Get location in a specific format for different APIs
  getLocationString(location: LocationData): string {
    return `${location.latitude},${location.longitude}`;
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  clearCache(): void {
    this.cachedLocation = null;
  }
}

export const geolocationService = GeolocationService.getInstance();