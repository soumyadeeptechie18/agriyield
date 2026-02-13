export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
  TELUGU = 'te',
  TAMIL = 'ta',
  GUJARATI = 'gu',
  BANGLA = 'bn',
  URDU = 'ur'
}

export interface WeatherData {
  day: string;
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Storm';
  rainProb: number;
}

export interface PredictionResult {
  yield: number; // kg per hectare
  confidenceLow: number;
  confidenceHigh: number;
  accuracy: number;
  costSaving: number; // in INR
  districtAvg: number;
}

export interface FarmRecord {
  id: string;
  date: string;
  crop: string;
  yield: number;
  season: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskAlert {
  type: string;
  level: RiskLevel;
  message: string;
  action: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isAudio?: boolean;
}