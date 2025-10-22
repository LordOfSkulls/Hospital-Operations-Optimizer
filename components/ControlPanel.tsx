import React, { useState, useMemo } from 'react';
import type { PredictionType, ManualPredictionInput, FilePredictionInput } from '../types';
import { PREDICTION_TYPES } from '../constants';
import { LoadingSpinnerIcon } from './icons/LoadingSpinnerIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ControlPanelProps {
  selectedMetrics: PredictionType[];
  onMetricsChange: (metrics: PredictionType[]) => void;
  onPredict: (input: ManualPredictionInput | FilePredictionInput) => void;
  isLoading: boolean;
  onClose?: () => void;
}

const Label: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-600 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            active ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`}
    >
        {children}
    </button>
);

const Checkbox: React.FC<{ id: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            id={id}
            name={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 bg-slate-100"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-slate-700">{label}</label>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ selectedMetrics, onMetricsChange, onPredict, isLoading, onClose }) => {
  const [inputType, setInputType] = useState<'manual' | 'file'>('manual');
  
  const [manualInputs, setManualInputs] = useState<Omit<ManualPredictionInput, 'dataType'>>({
    occupiedBeds: 425,
    scheduledSurgeries: 25,
    avgDischargeRate: 40,
    erArrivalsPerHour: 12,
    timeOfDay: new Date().toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  });

  const [fileInput, setFileInput] = useState<Omit<FilePredictionInput, 'dataType'>>({
    fileName: '',
    fileContent: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManualInputs(prev => ({ ...prev, [name]: name === 'occupiedBeds' || name.includes('Rate') ? parseFloat(value) : (name.includes('Surgeries') || name.includes('Arrivals') ? parseInt(value, 10) : value) }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setFileInput({ fileName: selectedFile.name, fileContent: content });
        };
        reader.readAsText(selectedFile);
    }
  };
  
  const handleMetricChange = (metric: PredictionType, checked: boolean) => {
    if (checked) {
        onMetricsChange([...selectedMetrics, metric]);
    } else {
        onMetricsChange(selectedMetrics.filter(m => m !== metric));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        onMetricsChange(Object.values(PREDICTION_TYPES));
    } else {
        onMetricsChange([]);
    }
  };

  const allMetricsSelected = selectedMetrics.length === Object.values(PREDICTION_TYPES).length;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMetrics.length === 0) {
        alert("Please select at least one metric to predict.");
        return;
    }
    if (inputType === 'manual') {
        onPredict({ dataType: 'manual', ...manualInputs });
    } else {
        if (fileInput.fileContent) {
            onPredict({ dataType: 'file', ...fileInput });
        } else {
            alert('Please select a file to upload.');
        }
    }
    if (onClose) onClose(); // Close panel on mobile after submitting
  };
  
  const timeOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(i, 0, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  }), []);

  const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700">Analysis Controls</h2>
        {onClose && (
            <button 
                onClick={onClose}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 lg:hidden"
                aria-label="Close controls menu"
            >
                <CloseIcon className="h-6 w-6" />
            </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Metrics to Predict</Label>
          <div className="space-y-2 mt-2 p-3 bg-slate-50 rounded-md border border-slate-200">
            {Object.values(PREDICTION_TYPES).map(pt => (
                <Checkbox 
                    key={pt} 
                    id={pt} 
                    label={pt} 
                    checked={selectedMetrics.includes(pt)} 
                    onChange={e => handleMetricChange(pt, e.target.checked)}
                />
            ))}
            <div className="pt-2 border-t border-slate-200">
                <Checkbox
                    id="all"
                    label="All of the above"
                    checked={allMetricsSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200">
            <Label htmlFor="input-type">Data Source</Label>
            <div id="input-type" className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <TabButton active={inputType === 'manual'} onClick={() => setInputType('manual')}>Manual Input</TabButton>
                <TabButton active={inputType === 'file'} onClick={() => setInputType('file')}>Upload Data</TabButton>
            </div>
        </div>
        
        {inputType === 'manual' ? (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div>
                <Label htmlFor="occupiedBeds">Number of Beds Occupied</Label>
                <Input type="number" id="occupiedBeds" name="occupiedBeds" value={manualInputs.occupiedBeds} onChange={handleManualInputChange} min="0" required />
              </div>
              <div>
                <Label htmlFor="scheduledSurgeries">Scheduled Surgeries (Today)</Label>
                <Input type="number" id="scheduledSurgeries" name="scheduledSurgeries" value={manualInputs.scheduledSurgeries} onChange={handleManualInputChange} min="0" required />
              </div>
              <div>
                <Label htmlFor="avgDischargeRate">Avg. Discharges / Day</Label>
                <Input type="number" id="avgDischargeRate" name="avgDischargeRate" value={manualInputs.avgDischargeRate} onChange={handleManualInputChange} min="0" required />
              </div>
              <div>
                <Label htmlFor="erArrivalsPerHour">ER Arrivals / Hour (Current)</Label>
                <Input type="number" id="erArrivalsPerHour" name="erArrivalsPerHour" value={manualInputs.erArrivalsPerHour} onChange={handleManualInputChange} min="0" required />
              </div>
              <div>
                <Label htmlFor="timeOfDay">Time of Day</Label>
                <Select id="timeOfDay" name="timeOfDay" value={manualInputs.timeOfDay} onChange={handleManualInputChange}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select id="dayOfWeek" name="dayOfWeek" value={manualInputs.dayOfWeek} onChange={handleManualInputChange}>
                  {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
            </div>
        ) : (
            <div className="space-y-4 pt-2 animate-fade-in">
                <Label htmlFor="file-upload">Upload CSV or Excel File</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .txt" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">CSV, XLS, XLSX, TXT up to 10MB</p>
                        {file && <p className="text-sm font-medium text-slate-700 pt-2">{file.name}</p>}
                    </div>
                </div>
            </div>
        )}
        
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
          {isLoading ? (
              <>
                <LoadingSpinnerIcon className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
          ) : 'Generate Prediction'}
        </button>
      </form>
    </div>
  );
};