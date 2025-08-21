import { LocationData } from './geolocation.service';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  pressure: number;
  description: string;
  icon: string;
  location: string;
  timestamp: number;
}

export interface NDVIData {
  value: number;
  interpretation: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  date: string;
  cloudCover: number;
  location: string;
}

export interface SoilMoistureData {
  moistureLevel: number;
  status: 'Very Dry' | 'Dry' | 'Optimal' | 'Wet' | 'Very Wet';
  temperature: number;
  recommendation: string;
  lastUpdated: string;
}

class ApiService {
  private static instance: ApiService;
  private readonly BASE_WEATHER_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly NDVI_API_URL = 'https://api.nasa.gov/planetary/earth';
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async fetchWeatherData(location: LocationData): Promise<WeatherData> {
    try {
      // Simulate API call - Replace with actual weather API
      await this.delay(1000 + Math.random() * 1000);
      
      // Realistic weather data based on typical agricultural regions
      const temperature = 22 + Math.random() * 15; // 22-37°C
      const humidity = 40 + Math.random() * 40; // 40-80%
      const rainfall = Math.random() * 50; // 0-50mm
      const windSpeed = Math.random() * 15; // 0-15 m/s
      const pressure = 1000 + Math.random() * 50; // 1000-1050 hPa
      
      return {
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        rainfall: Math.round(rainfall * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        pressure: Math.round(pressure),
        description: this.getWeatherDescription(temperature, humidity, rainfall),
        icon: this.getWeatherIcon(temperature, rainfall),
        location: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }

  async fetchNDVIData(location: LocationData): Promise<NDVIData> {
    try {
      // Simulate NDVI API call
      await this.delay(1500 + Math.random() * 1000);
      
      // NDVI values typically range from -1 to 1, with agricultural areas usually 0.2-0.8
      const ndviValue = 0.2 + Math.random() * 0.6;
      const cloudCover = Math.random() * 30; // 0-30% cloud cover
      
      return {
        value: Math.round(ndviValue * 1000) / 1000,
        interpretation: this.interpretNDVI(ndviValue),
        date: new Date().toISOString().split('T')[0],
        cloudCover: Math.round(cloudCover),
        location: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      };
    } catch (error) {
      throw new Error(`Failed to fetch NDVI data: ${error}`);
    }
  }

  async fetchSoilMoistureData(location: LocationData): Promise<SoilMoistureData> {
    try {
      // Simulate soil moisture API call
      await this.delay(800 + Math.random() * 800);
      
      const moistureLevel = Math.random() * 100; // 0-100%
      const soilTemperature = 15 + Math.random() * 20; // 15-35°C
      
      return {
        moistureLevel: Math.round(moistureLevel),
        status: this.getMoistureStatus(moistureLevel),
        temperature: Math.round(soilTemperature * 10) / 10,
        recommendation: this.getMoistureRecommendation(moistureLevel),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to fetch soil moisture data: ${error}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getWeatherDescription(temp: number, humidity: number, rainfall: number): string {
    if (rainfall > 20) return 'Heavy rainfall expected';
    if (rainfall > 5) return 'Light rain showers';
    if (humidity > 70) return 'High humidity conditions';
    if (temp > 32) return 'Hot and dry conditions';
    if (temp < 18) return 'Cool weather conditions';
    return 'Favorable weather conditions';
  }

  private getWeatherIcon(temp: number, rainfall: number): string {
    if (rainfall > 5) return '🌧️';
    if (temp > 30) return '☀️';
    if (temp < 20) return '⛅';
    return '🌤️';
  }

  private interpretNDVI(value: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
    if (value < 0.3) return 'Poor';
    if (value < 0.5) return 'Fair';
    if (value < 0.7) return 'Good';
    return 'Excellent';
  }

  private getMoistureStatus(level: number): 'Very Dry' | 'Dry' | 'Optimal' | 'Wet' | 'Very Wet' {
    if (level < 20) return 'Very Dry';
    if (level < 40) return 'Dry';
    if (level < 70) return 'Optimal';
    if (level < 85) return 'Wet';
    return 'Very Wet';
  }

  private getMoistureRecommendation(level: number): string {
    if (level < 20) return 'Immediate irrigation required';
    if (level < 40) return 'Consider irrigation within 24 hours';
    if (level < 70) return 'Soil moisture levels are optimal';
    if (level < 85) return 'Monitor drainage, reduce irrigation';
    return 'Improve drainage, halt irrigation';
  }
}

export const apiService = ApiService.getInstance();