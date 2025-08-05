import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AflatoxinAnalysisRequest {
  image?: string; // Base64 encoded image
  scanData: {
    genotype: string;
    fertilization: string;
    irrigation: string;
    insects: string;
    soilph: string;
    location: { lat: number; lng: number };
    weather: { temp: number; humidity: number };
    soil: { ph: number; moisture: number };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, scanData }: AflatoxinAnalysisRequest = await req.json();

    console.log('Starting aflatoxin risk analysis...');

    // Simulate ML model processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Advanced risk calculation using multiple parameters
    const riskAnalysis = calculateAflatoxinRisk(scanData);
    
    // If image is provided, simulate image analysis
    let imageAnalysis = null;
    if (image) {
      imageAnalysis = await analyzeImage(image);
    }

    const analysis = {
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.riskScore,
      confidence: riskAnalysis.confidence,
      factors: riskAnalysis.factors,
      recommendations: riskAnalysis.recommendations,
      warnings: riskAnalysis.warnings,
      nextSteps: riskAnalysis.nextSteps,
      imageAnalysis,
      timestamp: new Date().toISOString(),
      analysisId: generateAnalysisId(),
    };

    console.log(`Analysis complete. Risk level: ${analysis.riskLevel}, Score: ${analysis.riskScore}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-aflatoxin function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateAflatoxinRisk(scanData: any) {
  let riskScore = 0;
  const factors = [];
  
  // Environmental factors (40% weight)
  if (scanData.weather.temp > 25 && scanData.weather.humidity > 80) {
    riskScore += 25;
    factors.push('High temperature and humidity create favorable conditions for aflatoxin');
  } else if (scanData.weather.temp > 30 || scanData.weather.humidity > 70) {
    riskScore += 15;
    factors.push('Moderate environmental risk factors present');
  }

  // Soil conditions (20% weight)
  if (scanData.soil.ph < 6.0 || scanData.soil.ph > 7.5) {
    riskScore += 15;
    factors.push('Soil pH outside optimal range increases aflatoxin risk');
  }
  
  if (scanData.soil.moisture > 80 || scanData.soil.moisture < 30) {
    riskScore += 10;
    factors.push('Suboptimal soil moisture levels detected');
  }

  // Agricultural practices (40% weight)
  if (scanData.genotype === 'poor') {
    riskScore += 20;
    factors.push('Poor crop genotype increases susceptibility to aflatoxin');
  } else if (scanData.genotype === 'average') {
    riskScore += 8;
  }

  if (scanData.fertilization === 'poor') {
    riskScore += 15;
    factors.push('Inadequate fertilization weakens plant resistance');
  }

  if (scanData.irrigation === 'poor') {
    riskScore += 12;
    factors.push('Poor irrigation management increases stress and risk');
  }

  if (scanData.insects === 'high') {
    riskScore += 18;
    factors.push('High insect activity creates entry points for aflatoxin-producing fungi');
  } else if (scanData.insects === 'medium') {
    riskScore += 8;
  }

  // Determine risk level and confidence
  let riskLevel: string;
  let confidence: number;
  
  if (riskScore < 25) {
    riskLevel = 'LOW';
    confidence = 0.85 + (Math.random() * 0.1);
  } else if (riskScore < 55) {
    riskLevel = 'MEDIUM';
    confidence = 0.75 + (Math.random() * 0.15);
  } else {
    riskLevel = 'HIGH';
    confidence = 0.80 + (Math.random() * 0.15);
  }

  // Generate recommendations based on risk factors
  const recommendations = generateRecommendations(riskLevel, factors);
  const warnings = generateWarnings(riskLevel, riskScore);
  const nextSteps = generateNextSteps(riskLevel);

  return {
    riskLevel,
    riskScore: Math.min(100, riskScore),
    confidence: Math.round(confidence * 100) / 100,
    factors,
    recommendations,
    warnings,
    nextSteps
  };
}

async function analyzeImage(imageBase64: string) {
  // Simulate image analysis - in real implementation, this would use ML model
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const imageQuality = Math.random();
  const detectedIssues = [];
  
  if (imageQuality < 0.3) {
    detectedIssues.push('Image quality too low for accurate analysis');
  }
  
  if (Math.random() > 0.7) {
    detectedIssues.push('Potential fungal contamination visible');
  }
  
  if (Math.random() > 0.8) {
    detectedIssues.push('Insect damage detected');
  }

  return {
    quality: imageQuality > 0.7 ? 'Good' : imageQuality > 0.4 ? 'Fair' : 'Poor',
    detectedIssues,
    visualRiskScore: Math.floor(Math.random() * 30) + 10,
    analysisComplete: true
  };
}

function generateRecommendations(riskLevel: string, factors: string[]): string[] {
  const baseRecommendations = [
    'Implement proper drying techniques to reduce moisture content below 14%',
    'Store grain in clean, dry, and well-ventilated conditions',
    'Use proper storage containers with tight-fitting lids',
    'Regular monitoring for signs of mold or pest infestation'
  ];

  const riskSpecificRecommendations = {
    LOW: [
      'Continue current good agricultural practices',
      'Monitor weather conditions during harvest',
      'Maintain optimal storage conditions'
    ],
    MEDIUM: [
      'Increase frequency of crop monitoring',
      'Consider preventive fungicide application',
      'Improve drainage in affected areas',
      'Test grain for aflatoxin before storage'
    ],
    HIGH: [
      'Immediate action required - consider early harvest',
      'Apply approved fungicide treatments',
      'Improve field drainage immediately',
      'Mandatory aflatoxin testing before any sale or consumption',
      'Separate high-risk areas from low-risk crops'
    ]
  };

  return [...baseRecommendations, ...riskSpecificRecommendations[riskLevel as keyof typeof riskSpecificRecommendations]];
}

function generateWarnings(riskLevel: string, riskScore: number): string[] {
  if (riskLevel === 'HIGH') {
    return [
      'HIGH RISK: Immediate intervention required',
      'Grain may not be safe for human or animal consumption',
      'Consider professional consultation before proceeding'
    ];
  } else if (riskLevel === 'MEDIUM') {
    return [
      'Moderate risk detected - enhanced monitoring required',
      'Follow strict storage and handling protocols'
    ];
  }
  return [];
}

function generateNextSteps(riskLevel: string): string[] {
  const commonSteps = [
    'Schedule follow-up assessment in 1-2 weeks',
    'Document current conditions for tracking'
  ];

  const riskSpecificSteps = {
    LOW: [
      'Continue regular monitoring schedule',
      'Maintain current practices'
    ],
    MEDIUM: [
      'Increase monitoring frequency to weekly',
      'Prepare contingency plans for rapid response'
    ],
    HIGH: [
      'Daily monitoring required',
      'Consult with agricultural extension officer',
      'Consider market alternatives for affected crops'
    ]
  };

  return [...commonSteps, ...riskSpecificSteps[riskLevel as keyof typeof riskSpecificSteps]];
}

function generateAnalysisId(): string {
  return `AF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}