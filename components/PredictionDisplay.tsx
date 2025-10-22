import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PredictionType, PredictionOutput, PredictionInput, BedOccupancyPrediction, WaitingTimePrediction, ERLoadPrediction } from '../types';
import { PREDICTION_TYPES } from '../constants';
import { LoadingSpinnerIcon } from './icons/LoadingSpinnerIcon';
import { BulbIcon } from './icons/BulbIcon';
import { ChartIcon } from './icons/ChartIcon';
import { WarningIcon } from './icons/WarningIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface PredictionDisplayProps {
  predictionTypes: PredictionType[];
  output: PredictionOutput | null;
  input: PredictionInput | null;
  isLoading: boolean;
  error: string | null;
}

const WelcomeState: React.FC = () => (
    <div className="text-center p-8">
      <ChartIcon className="mx-auto h-16 w-16 text-slate-400 mb-4" />
      <h3 className="text-2xl font-bold text-slate-700">Prediction Dashboard</h3>
      <p className="mt-2 text-slate-500">
        Use the controls to select metrics, input data, and click "Generate Prediction" to see AI-powered operational insights.
      </p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
      <LoadingSpinnerIcon className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <h3 className="text-xl font-semibold text-slate-700">Generating Predictions...</h3>
      <p className="mt-1 text-slate-500">The AI is analyzing the data. This might take a moment.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-xl font-bold text-red-700">An Error Occurred</h3>
                <p className="mt-2 text-red-600">{message}</p>
                <div className="mt-4 text-left text-sm text-slate-700 max-w-xl mx-auto">
                    <ul className="list-disc pl-6">
                        <li>Check that your <b>GEMINI_API_KEY</b> is set correctly in <code>.env.local</code> and restart the dev server after changes.</li>
                        <li>Ensure your API key is valid and has sufficient quota.</li>
                        <li>Verify your network connection.</li>
                        <li>If the error persists, check the browser console and server logs for more details.</li>
                    </ul>
                </div>
        </div>
);

const ResultCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <div className="bg-slate-50 p-6 rounded-lg text-center border border-slate-200">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-5xl font-bold text-blue-600 mt-2">
            {value}<span className="text-3xl text-slate-400 ml-1">{unit}</span>
        </p>
    </div>
);

const Section: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, icon, children }) => (
    <div className="mt-8">
        <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2 mb-3">
            {icon}
            {title}
        </h4>
        {children}
    </div>
);

const CollapsibleSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mt-6 border-t border-slate-200 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-slate-700"
            >
                <span className="flex items-center gap-2">
                    {icon}
                    {title}
                </span>
                <ChevronDownIcon className={`h-6 w-6 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-4 animate-fade-in">{children}</div>}
        </div>
    );
};

const renderPrediction = (predictionType: PredictionType, predictionData: any) => {
    switch (predictionType) {
        case PREDICTION_TYPES.BED_OCCUPANCY:
            const bedData = predictionData as BedOccupancyPrediction;
            return <ResultCard title="Predicted Bed Occupancy" value={bedData.predictedOccupancy.toFixed(1)} unit="%" />;
        case PREDICTION_TYPES.WAITING_TIME:
            const waitData = predictionData as WaitingTimePrediction;
            return <ResultCard title="Predicted ER Wait Time" value={waitData.predictedWaitTimeHours.toFixed(1)} unit="hr" />;
        case PREDICTION_TYPES.ER_LOAD:
            const erData = predictionData as ERLoadPrediction;
            return (
                <div className="h-80 w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={erData.predictedLoad} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                            <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: 'currentColor' }} className="text-slate-600" />
                            <YAxis stroke="#64748b" tick={{ fill: 'currentColor' }} className="text-slate-600" />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                            <Legend wrapperStyle={{ color: '#334155' }} />
                            <Bar dataKey="patients" fill="#3b82f6" name="Predicted Patients"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        default: return null;
    }
}

const predictionOrder = [
    PREDICTION_TYPES.BED_OCCUPANCY, 
    PREDICTION_TYPES.WAITING_TIME, 
    PREDICTION_TYPES.ER_LOAD
];

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ output, isLoading, error }) => {
  if (isLoading) return <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200"><LoadingState /></div>;
  if (error) return <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200"><ErrorState message={error} /></div>;
  if (!output) return <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200"><WelcomeState /></div>;

  const hasPredictions = output.predictions && Object.keys(output.predictions).length > 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-1">
            Prediction Analysis
        </h3>
        <p className="text-sm text-slate-500 mb-6">
            Forecast for the next 24 hours.
        </p>
        
        <div className="mt-6">
            {hasPredictions ? (
                <div className="grid grid-cols-1 gap-8">
                    {predictionOrder.map(metric => {
                        const predictionData = output.predictions?.[metric];
                        if (predictionData) {
                            return (
                                <div key={metric} className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
                                    <h4 className="text-xl font-semibold text-slate-700 mb-4">{metric}</h4>
                                    {renderPrediction(metric, predictionData)}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            ) : (
                <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-slate-700">Predictions Not Available</h4>
                    <p className="mt-1 text-slate-500">The AI could not generate confident predictions from the provided data.</p>
                </div>
            )}
        </div>

        <Section title="Overall Explanation" icon={<ChartIcon className="h-6 w-6 text-slate-500" />}>
            <p className="text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-200">{output.explanation}</p>
        </Section>
        
        {output.recommendations && output.recommendations.length > 0 && (
            <CollapsibleSection title="AI Recommendations" icon={<BulbIcon className="h-6 w-6 text-yellow-500" />}>
                <ul className="space-y-3">
                    {output.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                            <span className="flex-shrink-0 h-6 w-6 text-blue-600 font-bold text-center mt-0.5">✓</span>
                            <p className="text-slate-700">{rec}</p>
                        </li>
                    ))}
                </ul>
            </CollapsibleSection>
        )}

        {output.warnings && output.warnings.length > 0 && (
            <CollapsibleSection title="Data Warnings" icon={<WarningIcon className="h-6 w-6 text-amber-500" />}>
                <ul className="space-y-3">
                    {output.warnings.map((warn, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-md">
                            <WarningIcon className="flex-shrink-0 h-5 w-5 text-amber-600 mt-0.5" />
                            <p className="text-amber-800">{warn}</p>
                        </li>
                    ))}
                </ul>
            </CollapsibleSection>
        )}
    </div>
  );
};