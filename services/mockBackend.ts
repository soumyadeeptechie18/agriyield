import { PredictionResult, RiskAlert, FarmRecord, WeatherData } from '../types';
import { CROPS } from '../constants';

// --- MOCK DATABASE ---
const STORAGE_KEY_RECORDS = 'agri_app_records';

export const getFarmRecords = (): FarmRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY_RECORDS);
  if (!data) {
    // Seed some mock data
    const seed: FarmRecord[] = [
      { id: '1', date: '2023-06-15', crop: 'Rice', yield: 4200, season: 'Kharif' },
      { id: '2', date: '2023-11-20', crop: 'Wheat', yield: 3800, season: 'Rabi' },
      { id: '3', date: '2024-06-10', crop: 'Soybean', yield: 2100, season: 'Kharif' },
    ];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

export const saveFarmRecord = (record: FarmRecord) => {
  const current = getFarmRecords();
  const updated = [record, ...current];
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
};

// --- MOCK ML MODEL (Random Forest Simulator) ---
// This mimics the logic of a Python Scikit-Learn model trained on agri data
export const predictYieldMock = async (
  crop: string,
  district: string,
  soil: string,
  rainfall: number,
  fertilizer: number,
  area: number
): Promise<PredictionResult> => {
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Base yields (kg/ha) for crops (heuristics)
  const baseYields: Record<string, number> = {
    'Rice': 4000,
    'Wheat': 3500,
    'Maize': 5000,
    'Cotton': 2000,
    'Sugarcane': 80000,
    'Soybean': 2500
  };

  let prediction = baseYields[crop] || 3000;

  // Adjust for rainfall (Optimal range assumption: 800-1200mm)
  if (rainfall < 600) prediction *= 0.7; // Drought stress
  else if (rainfall > 1400) prediction *= 0.85; // Flood stress
  else prediction *= 1.1; // Optimal

  // Adjust for Fertilizer (Simplistic curve)
  // Assume 100-150kg/ha is optimal
  const fertilizerPerHa = fertilizer / area; 
  if (fertilizerPerHa < 50) prediction *= 0.8;
  else if (fertilizerPerHa > 200) prediction *= 0.95; // Over-fertilization burn
  else prediction *= 1.05;

  // Add some randomness for the "AI" feel
  const noise = (Math.random() - 0.5) * 200;
  prediction += noise;

  const districtAvg = prediction * (0.9 + Math.random() * 0.2);

  return {
    yield: Math.round(prediction),
    confidenceLow: Math.round(prediction * 0.92),
    confidenceHigh: Math.round(prediction * 1.08),
    accuracy: 92 + Math.round(Math.random() * 5),
    costSaving: Math.round(area * 1500 * (Math.random() + 0.5)), // Mock cost saving calc
    districtAvg: Math.round(districtAvg)
  };
};

// --- WEATHER SERVICE ---
export const getForecast = (): WeatherData[] => {
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map((day, i) => {
    const isRainy = Math.random() > 0.7;
    return {
      day,
      temp: 28 + Math.round((Math.random() - 0.5) * 6),
      condition: isRainy ? 'Rainy' : (Math.random() > 0.5 ? 'Sunny' : 'Cloudy'),
      rainProb: isRainy ? 80 : 10
    };
  });
};

// --- RISK ANALYSIS ---
export const analyzeRisk = (weather: WeatherData[], crop: string): RiskAlert[] => {
  const alerts: RiskAlert[] = [];
  const rainyDays = weather.filter(d => d.condition === 'Rainy').length;
  
  if (rainyDays > 3) {
    alerts.push({
      type: 'Disease',
      level: 'High',
      message: 'High humidity detected. Risk of fungal infection.',
      action: 'Apply fungicide immediately.'
    });
  }
  
  if (weather[0].temp > 35) {
    alerts.push({
      type: 'Heat',
      level: 'Medium',
      message: 'Heat stress likely for young crops.',
      action: 'Irrigate in evening.'
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'General',
      level: 'Low',
      message: 'Conditions are favorable for growth.',
      action: 'Monitor soil moisture.'
    });
  }

  return alerts;
};