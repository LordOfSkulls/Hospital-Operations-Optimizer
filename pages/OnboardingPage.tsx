import React, { useState } from 'react';
import type { HospitalProfile } from '../types';
import { HospitalIcon } from '../components/icons/HospitalIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import { LoadingSpinnerIcon } from '../components/icons/LoadingSpinnerIcon';
import { getProfileFromData } from '../services/geminiService';

interface OnboardingPageProps {
  userProfile: HospitalProfile;
  onOnboardingComplete: (profileData: Omit<HospitalProfile, 'hospitalId'>) => void;
}

const Label: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-600 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
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


export const OnboardingPage: React.FC<OnboardingPageProps> = ({ userProfile, onOnboardingComplete }) => {
  const [inputType, setInputType] = useState<'manual' | 'file'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    totalBeds: '',
    totalErRooms: '',
    totalStaff: '',
    avgPatientsPerDoctor: '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setFileContent(content);
        };
        reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (inputType === 'manual') {
        onOnboardingComplete({
            totalBeds: parseInt(formData.totalBeds, 10) || 0,
            totalErRooms: parseInt(formData.totalErRooms, 10) || 0,
            totalStaff: parseInt(formData.totalStaff, 10) || 0,
            avgPatientsPerDoctor: formData.avgPatientsPerDoctor ? parseFloat(formData.avgPatientsPerDoctor) : null,
        });
      } else {
        if (!fileContent) {
            throw new Error("Please select and upload a file.");
        }
        const profileData = await getProfileFromData(fileContent);
        onOnboardingComplete(profileData);
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="w-full max-w-2xl mx-auto p-8">
            <div className="text-center mb-8">
                <HospitalIcon className="h-20 w-20 mx-auto text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">
                    Welcome, {userProfile.hospitalId}!
                </h1>
                <p className="text-slate-500 mt-1">
                    Let's set up your hospital's baseline configuration.
                </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                      <TabButton active={inputType === 'manual'} onClick={() => setInputType('manual')}>Manual Input</TabButton>
                      <TabButton active={inputType === 'file'} onClick={() => setInputType('file')}>Upload File</TabButton>
                    </div>

                    {inputType === 'manual' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                          <div>
                              <Label htmlFor="totalBeds">Total Beds</Label>
                              <Input id="totalBeds" name="totalBeds" type="number" value={formData.totalBeds} onChange={handleChange} placeholder="e.g., 500" required />
                          </div>
                          <div>
                              <Label htmlFor="totalErRooms">Total ER Rooms</Label>
                              <Input id="totalErRooms" name="totalErRooms" type="number" value={formData.totalErRooms} onChange={handleChange} placeholder="e.g., 20" required />
                          </div>
                          <div>
                              <Label htmlFor="totalStaff">Total Staff on Duty (Avg.)</Label>
                              <Input id="totalStaff" name="totalStaff" type="number" value={formData.totalStaff} onChange={handleChange} placeholder="e.g., 450" required />
                          </div>
                          <div>
                              <Label htmlFor="avgPatientsPerDoctor">Avg. Patients per Doctor / Hour</Label>
                              <Input id="avgPatientsPerDoctor" name="avgPatientsPerDoctor" type="number" step="0.1" value={formData.avgPatientsPerDoctor} onChange={handleChange} placeholder="Optional, e.g., 2.5" />
                          </div>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <Label htmlFor="file-upload">Upload Operational Data File</Label>
                        <p className="text-sm text-slate-500 mb-2">Upload a file (CSV, TXT) with details like bed counts, staffing levels, etc.</p>
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
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <>
                                <LoadingSpinnerIcon className="h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : 'Save and Continue to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};