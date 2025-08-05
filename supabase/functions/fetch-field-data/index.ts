import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FieldDataRequest {
  lat: number;
  lng: number;
  parameters?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, parameters = [] }: FieldDataRequest = await req.json();

    console.log(`Fetching field data for coordinates: ${lat}, ${lng}`);

    // Simulate real API calls with realistic data
    const fieldData = {
      location: {
        lat,
        lng,
        address: await getLocationName(lat, lng),
        elevation: Math.floor(Math.random() * 2000) + 500, // 500-2500m
      },
      weather: {
        temperature: Math.floor(Math.random() * 15) + 18, // 18-33°C
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        precipitation: Math.floor(Math.random() * 10), // 0-10mm
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        condition: getWeatherCondition(),
        uvIndex: Math.floor(Math.random() * 8) + 3, // 3-11
      },
      soil: {
        ph: (Math.random() * 3 + 5.5).toFixed(1), // 5.5-8.5
        moisture: Math.floor(Math.random() * 40) + 30, // 30-70%
        organicMatter: (Math.random() * 5 + 2).toFixed(1), // 2-7%
        nitrogen: Math.floor(Math.random() * 50) + 20, // 20-70 ppm
        phosphorus: Math.floor(Math.random() * 30) + 10, // 10-40 ppm
        potassium: Math.floor(Math.random() * 100) + 50, // 50-150 ppm
        nutrients: getNutrientLevel(),
        texture: getSoilTexture(),
      },
      vegetation: {
        ndvi: (Math.random() * 0.6 + 0.3).toFixed(2), // 0.3-0.9
        biomass: Math.floor(Math.random() * 5000) + 2000, // 2000-7000 kg/ha
        chlorophyll: (Math.random() * 40 + 30).toFixed(1), // 30-70 SPAD
        leafAreaIndex: (Math.random() * 4 + 2).toFixed(1), // 2-6
        stressLevel: getStressLevel(),
      },
      pests: {
        detected: Math.random() > 0.7,
        types: getPestTypes(),
        severity: getPestSeverity(),
        treatmentRecommended: Math.random() > 0.5,
      },
      growthPrediction: {
        yieldEstimate: Math.floor(Math.random() * 3000) + 4000, // 4000-7000 kg/ha
        harvestDate: getHarvestDate(),
        growthStage: getGrowthStage(),
        healthScore: Math.floor(Math.random() * 30) + 70, // 70-100
      },
      recommendations: generateRecommendations(),
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(fieldData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-field-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getLocationName(lat: number, lng: number): Promise<string> {
  // Simplified location lookup - in real implementation, use geocoding API
  const locations = [
    'Nairobi County, Kenya',
    'Kiambu County, Kenya', 
    'Nakuru County, Kenya',
    'Meru County, Kenya',
    'Kisumu County, Kenya'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getWeatherCondition(): string {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  return conditions[Math.floor(Math.random() * conditions.length)];
}

function getNutrientLevel(): string {
  const levels = ['Low', 'Medium', 'High', 'Optimal'];
  return levels[Math.floor(Math.random() * levels.length)];
}

function getSoilTexture(): string {
  const textures = ['Clay', 'Loam', 'Sandy Loam', 'Silt Loam', 'Clay Loam'];
  return textures[Math.floor(Math.random() * textures.length)];
}

function getStressLevel(): string {
  const levels = ['None', 'Low', 'Moderate', 'High'];
  return levels[Math.floor(Math.random() * levels.length)];
}

function getPestTypes(): string[] {
  const pests = ['Aphids', 'Cutworms', 'Corn Borer', 'Armyworm', 'Thrips'];
  return pests.filter(() => Math.random() > 0.6);
}

function getPestSeverity(): string {
  const severities = ['Low', 'Medium', 'High'];
  return severities[Math.floor(Math.random() * severities.length)];
}

function getHarvestDate(): string {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 90) + 30);
  return futureDate.toISOString().split('T')[0];
}

function getGrowthStage(): string {
  const stages = ['Germination', 'Vegetative', 'Tasseling', 'Silking', 'Grain Filling', 'Maturity'];
  return stages[Math.floor(Math.random() * stages.length)];
}

function generateRecommendations(): string[] {
  const recommendations = [
    'Apply nitrogen fertilizer at 120 kg/ha',
    'Monitor for pest activity, especially armyworms',
    'Adjust irrigation schedule based on soil moisture',
    'Consider fungicide application for disease prevention',
    'Implement crop rotation for next season',
    'Test soil pH and adjust if necessary',
    'Use organic mulch to improve soil health',
    'Schedule harvesting in optimal weather conditions'
  ];
  
  return recommendations
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 4) + 3);
}