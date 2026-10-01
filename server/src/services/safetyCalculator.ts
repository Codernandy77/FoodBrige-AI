export interface SafetyAssessmentInput {
  category: string;
  cookingDate: string;
  cookingTime: string;
  storageCondition: 'AMBIENT' | 'REFRIGERATED' | 'HOT_HOLDING';
  isExposed: boolean;
  isReheated: boolean;
  temperature?: number;
  pickupDeadline: string; // ISO string or time string
}

export interface SafetyAssessmentResult {
  safetyStatus: 'SAFE' | 'CAUTION' | 'URGENT REVIEW' | 'DO NOT DISTRIBUTE';
  priorityScore: number;
  remainingSafeWindowHours: number;
  warnings: string[];
  recommendedAction: string;
}

export const calculateSafetyAndPriority = (input: SafetyAssessmentInput): SafetyAssessmentResult => {
  const warnings: string[] = [];
  let safetyStatus: 'SAFE' | 'CAUTION' | 'URGENT REVIEW' | 'DO NOT DISTRIBUTE' = 'SAFE';
  let remainingSafeWindowHours = 4; // Default starting safe window for ambient fresh food
  let recommendedAction = "Proceed with normal pickup assignment.";

  // 1. Time Calculation
  const cookDateTime = new Date(`${input.cookingDate}T${input.cookingTime}`);
  const now = new Date();
  
  // Calculate elapsed time in hours (handle negative or future values robustly)
  let elapsedHours = (now.getTime() - cookDateTime.getTime()) / (1000 * 60 * 60);
  if (elapsedHours < 0) elapsedHours = 0; // Guard against future clock skew

  // Perishability factor based on category
  const cat = input.category.toLowerCase();
  const isHighPerishability = cat.includes('biryani') || cat.includes('meat') || cat.includes('non-veg') || cat.includes('curry') || cat.includes('milk') || cat.includes('dairy');
  const isLowPerishability = cat.includes('bakery') || cat.includes('fruit') || cat.includes('veg') || cat.includes('bread');

  // Adjust base safe window based on storage type
  if (input.storageCondition === 'REFRIGERATED') {
    remainingSafeWindowHours = isHighPerishability ? 24 : 36;
  } else if (input.storageCondition === 'HOT_HOLDING') {
    remainingSafeWindowHours = 6; // Hot holding keeps it safe but degrades over time
  } else {
    // Ambient
    remainingSafeWindowHours = isHighPerishability ? 4 : isLowPerishability ? 8 : 6;
  }

  // 2. Exposure & Reheat Adjustments
  if (input.isExposed) {
    remainingSafeWindowHours *= 0.6; // Reduce safe window by 40%
    warnings.push("Food was exposed to open air. High risk of airborne contamination.");
  }
  if (input.isReheated) {
    remainingSafeWindowHours *= 0.7; // Reduce safe window by 30%
    warnings.push("Food has been reheated previously. Double-reheating increases bacterial risk.");
  }

  // Danger zone temperature check (5°C to 60°C is the USDA danger zone)
  if (input.temperature !== undefined) {
    if (input.temperature > 5 && input.temperature < 60 && input.storageCondition === 'AMBIENT') {
      remainingSafeWindowHours *= 0.8;
      warnings.push(`Temperature (${input.temperature}°C) is in the bacterial growth danger zone (5°C - 60°C).`);
    }
  }

  // Calculate actual remaining hours left in the safety window
  const actualRemainingHours = Math.max(0, remainingSafeWindowHours - elapsedHours);

  // Determine safety status
  if (elapsedHours >= remainingSafeWindowHours) {
    safetyStatus = 'DO NOT DISTRIBUTE';
    recommendedAction = "Do not distribute. This food has exceeded safe storage limits.";
    warnings.push("Storage window has expired. Spoilage risk is extremely high.");
  } else if (actualRemainingHours < 1.0) {
    safetyStatus = 'URGENT REVIEW';
    recommendedAction = "NGO inspection required. Consume within 30 minutes of pickup.";
    warnings.push("Safety window is critically short. Immediate distribution required.");
  } else if (actualRemainingHours < 2.5) {
    safetyStatus = 'CAUTION';
    recommendedAction = "Verify visual appeal and smell upon volunteer arrival.";
    warnings.push("Moderate storage time elapsed. Distribute to nearby targets.");
  } else {
    safetyStatus = 'SAFE';
    recommendedAction = "Available for safe redistribution.";
  }

  // 3. Priority Score Calculation (0-100)
  // Higher score = More urgent
  let priorityScore = 0;

  // Factor A: Safety Status weight
  if (safetyStatus === 'DO NOT DISTRIBUTE') {
    priorityScore = 0; // Excluded from active matchmaking
  } else {
    const statusWeight = safetyStatus === 'URGENT REVIEW' ? 50 : safetyStatus === 'CAUTION' ? 30 : 15;
    
    // Factor B: Time urgency (how close is the pickup deadline or safety window expiration)
    let deadlineUrgency = 0;
    try {
      const deadlineTime = new Date(input.pickupDeadline);
      const hoursToDeadline = (deadlineTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursToDeadline <= 0) {
        deadlineUrgency = 40; // Past deadline, highly urgent if still safe
      } else if (hoursToDeadline < 2) {
        deadlineUrgency = 35;
      } else if (hoursToDeadline < 4) {
        deadlineUrgency = 20;
      } else {
        deadlineUrgency = 10;
      }
    } catch {
      deadlineUrgency = 15;
    }

    // Factor C: High Perishability + Quantity bonus
    const perishabilityBonus = isHighPerishability ? 10 : 0;

    priorityScore = Math.min(99, statusWeight + deadlineUrgency + perishabilityBonus);
  }

  return {
    safetyStatus,
    priorityScore: Math.round(priorityScore),
    remainingSafeWindowHours: parseFloat(actualRemainingHours.toFixed(1)),
    warnings,
    recommendedAction
  };
};
