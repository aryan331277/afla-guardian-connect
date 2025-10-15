interface RiskCalculationParams {
  healthyCount: number;
  aflatoxinCount: number;
  transport: string;
  storage: string;
  moisture?: number;
  temperature?: number;
  humidity?: number;
  weights?: {
    infection: number;
    transport: number;
    storage: number;
    environment: number;
  };
}

export interface AflatoxinRiskResult {
  riskScore: number;
  riskLevel: string;
  riskColor: string;
  recommendations: string[];
  warnings: string[];
  nextSteps: string[];
  detectionDetails: {
    healthyCount: number;
    aflatoxinCount: number;
    totalCount: number;
    infectionRatio: number;
  };
}

export class AflatoxinRiskService {
  calculateRisk(params: RiskCalculationParams): AflatoxinRiskResult {
    const {
      healthyCount,
      aflatoxinCount,
      transport,
      storage,
      moisture,
      temperature,
      humidity,
      weights = {
        infection: 0.55,
        transport: 0.15,
        storage: 0.15,
        environment: 0.15
      }
    } = params;

    // --- 1. Normalize categorical inputs ---
    const mapping: Record<string, number> = {
      'excellent': 1.0,
      'average': 0.5,
      'bad': 0.0,
      // Map user input values to quality levels
      'covered-truck': 1.0,
      'sacks': 0.5,
      'open-truck': 0.0,
      'dry-warehouse': 1.0,
      'outdoor-covered': 0.5,
      'outdoor-open': 0.0
    };

    const T = mapping[transport.toLowerCase()] ?? 0.5;
    const S = mapping[storage.toLowerCase()] ?? 0.5;

    // --- 2. Infection ratio ---
    const total = healthyCount + aflatoxinCount;
    const I = total > 0 ? aflatoxinCount / total : 0;

    // --- 3. Environmental factor (if given) ---
    let envFactor = 0;
    let envCount = 0;

    if (moisture !== undefined) {
      // High moisture = high risk (safe moisture for corn < 13%)
      envFactor += Math.min(Math.max((moisture - 13) / 20, 0), 1);
      envCount++;
    }

    if (temperature !== undefined) {
      // Ideal storage ~20°C; risk increases after 25°C
      envFactor += Math.min(Math.max((temperature - 25) / 20, 0), 1);
      envCount++;
    }

    if (humidity !== undefined) {
      // Humidity above 70% boosts aflatoxin risk
      envFactor += Math.min(Math.max((humidity - 70) / 30, 0), 1);
      envCount++;
    }

    // Average out the environmental factors if any are provided
    if (envCount > 0) {
      envFactor /= envCount;
    }

    // --- 4. Composite risk ---
    const R = 100 * (
      weights.infection * I +
      weights.transport * (1 - T) +
      weights.storage * (1 - S) +
      weights.environment * envFactor
    );

    const riskScore = Math.round(Math.min(Math.max(R, 0), 100) * 100) / 100;

    // --- 5. Determine risk level and color ---
    let riskLevel: string;
    let riskColor: string;

    if (riskScore >= 75) {
      riskLevel = 'Critical Risk';
      riskColor = 'red';
    } else if (riskScore >= 50) {
      riskLevel = 'High Risk';
      riskColor = 'orange';
    } else if (riskScore >= 25) {
      riskLevel = 'Medium Risk';
      riskColor = 'yellow';
    } else {
      riskLevel = 'Low Risk';
      riskColor = 'green';
    }

    // --- 6. Generate recommendations ---
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const nextSteps: string[] = [];

    // Infection-based recommendations
    if (I > 0.3) {
      warnings.push('High aflatoxin contamination detected in the corn sample.');
      recommendations.push('DO NOT consume or sell this corn. Aflatoxin levels are dangerous.');
      recommendations.push('Segregate contaminated corn immediately to prevent spread.');
    } else if (I > 0.15) {
      warnings.push('Moderate aflatoxin contamination detected.');
      recommendations.push('Consider professional testing before consumption or sale.');
      recommendations.push('Improve drying and storage conditions immediately.');
    } else if (I > 0) {
      recommendations.push('Minor contamination detected. Improve storage conditions.');
    } else {
      recommendations.push('No visible aflatoxin contamination detected.');
    }

    // Storage recommendations
    if (S < 0.5) {
      recommendations.push('Improve storage conditions: Use dry, ventilated warehouses.');
      nextSteps.push('Transfer corn to proper storage facility within 24 hours.');
    }

    // Transport recommendations
    if (T < 0.5) {
      recommendations.push('Use covered transport to prevent moisture exposure.');
      warnings.push('Poor transport conditions increase aflatoxin risk.');
    }

    // Environmental recommendations
    if (humidity !== undefined && humidity > 70) {
      warnings.push('High humidity significantly increases aflatoxin risk.');
      recommendations.push('Use dehumidifiers or improve ventilation immediately.');
    }

    if (temperature !== undefined && temperature > 30) {
      recommendations.push('High temperatures detected. Ensure proper ventilation and cooling.');
    }

    if (moisture !== undefined && moisture > 13) {
      warnings.push(`Moisture content (${moisture.toFixed(1)}%) is above safe levels.`);
      recommendations.push('Dry the grain to safe moisture levels (≤13%) immediately.');
    }

    // General recommendations
    recommendations.push('Store in a clean, dry, and well-ventilated area.');
    recommendations.push('Regular inspection for mold and pest infestation.');
    
    // Next steps
    nextSteps.push('Inspect storage area for leaks and pests.');
    if (riskScore > 50) {
      nextSteps.push('Re-test grain within 24-48 hours.');
      nextSteps.push('Consider professional laboratory testing.');
    } else {
      nextSteps.push('Re-test grain in 1 week if stored in current conditions.');
    }
    nextSteps.push('Maintain detailed records of storage and handling conditions.');

    return {
      riskScore,
      riskLevel,
      riskColor,
      recommendations,
      warnings,
      nextSteps,
      detectionDetails: {
        healthyCount,
        aflatoxinCount,
        totalCount: total,
        infectionRatio: I
      }
    };
  }
}

export const aflatoxinRiskService = new AflatoxinRiskService();
