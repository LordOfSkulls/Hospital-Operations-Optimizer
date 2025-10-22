import React, { useState, useCallback } from 'react';
import { ControlPanel } from '../components/ControlPanel';
import { Header } from '../components/Header';
import { PredictionDisplay } from '../components/PredictionDisplay';
import { getHospitalPrediction } from '../services/geminiService';
import type { PredictionType, PredictionInput, PredictionOutput, HospitalProfile } from '../types';
import { PREDICTION_TYPES } from '../constants';

interface DashboardPageProps {
  userProfile: HospitalProfile;
  onLogout: () => void;
  onGoToSettings: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userProfile, onGoToSettings }) => {
  const [selectedMetrics, setSelectedMetrics] = useState<PredictionType[]>([PREDICTION_TYPES.BED_OCCUPANCY]);
  const [predictionOutput, setPredictionOutput] = useState<PredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<PredictionInput | null>(null);

  const handlePrediction = useCallback(async (input: PredictionInput) => {
    if (selectedMetrics.length === 0) {
      setError("Please select at least one metric to predict.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPredictionOutput(null);
    setCurrentInput(input);

    try {
      const result = await getHospitalPrediction(selectedMetrics, input, userProfile);
      setPredictionOutput(result);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      let message = "An unknown error occurred. Please check the console for details.";
      if (err instanceof Error) {
        if (err.message.includes("API key is not configured")) {
          message = "Gemini API key is missing. Please set GEMINI_API_KEY in your .env.local file and restart the server.";
        } else if (err.message.includes("Failed to get a valid prediction")) {
          message = "Failed to get a valid prediction from the AI. This may be due to an invalid API key, network issues, or the model returning an unexpected format. Please check your API key, network connection, and quota.";
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMetrics, userProfile]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header userProfile={userProfile} onGoToSettings={onGoToSettings} />
      <div className="flex-grow container mx-auto p-4 lg:p-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 sticky top-24">
              <ControlPanel
                selectedMetrics={selectedMetrics}
                onMetricsChange={setSelectedMetrics}
                onPredict={handlePrediction}
                isLoading={isLoading}
              />
            </div>
          </aside>
          <main className="lg:col-span-8 xl:col-span-9 mt-8 lg:mt-0">
            <PredictionDisplay
              predictionTypes={selectedMetrics}
              output={predictionOutput}
              input={currentInput}
              isLoading={isLoading}
              error={error}
            />
          </main>
        </div>
      </div>
    </div>
  );
};