import { PREDICTION_TYPES } from './constants';

export type PredictionType = typeof PREDICTION_TYPES[keyof typeof PREDICTION_TYPES];

// --- User and Auth Types ---
export type AuthState = 'login' | 'onboarding' | 'dashboard' | 'settings';

export interface HospitalProfile {
  hospitalId: string;
  totalBeds: number;
  totalErRooms: number;
  totalStaff: number;
  avgPatientsPerDoctor: number | null;
}

// --- Prediction Input Types ---

// Input from the manual form
export interface ManualPredictionInput {
  dataType: 'manual';
  occupiedBeds: number;
  scheduledSurgeries: number;
  avgDischargeRate: number;
  erArrivalsPerHour: number;
  timeOfDay: string;
  dayOfWeek: string;
}

// Input from a file upload
export interface FilePredictionInput {
  dataType: 'file';
  fileName: string;
  fileContent: string;
}

export type PredictionInput = ManualPredictionInput | FilePredictionInput;

// --- Prediction Output Types ---
export interface ERLoadPredictionPoint {
  hour: string;
  patients: number;
}

export interface BedOccupancyPrediction {
  predictedOccupancy: number;
}

export interface WaitingTimePrediction {
  predictedWaitTimeHours: number;
}

export interface ERLoadPrediction {
  predictedLoad: ERLoadPredictionPoint[];
}

// The new unified response structure from the Gemini API
export interface PredictionOutput {
  predictions: {
    [PREDICTION_TYPES.BED_OCCUPANCY]?: BedOccupancyPrediction;
    [PREDICTION_TYPES.WAITING_TIME]?: WaitingTimePrediction;
    [PREDICTION_TYPES.ER_LOAD]?: ERLoadPrediction;
  } | null;
  explanation: string;
  warnings: string[];
  recommendations: string[]; // Actionable operational recommendations
}