import React, { useState } from 'react';
import type { HospitalProfile } from '../types';
import { SaveIcon } from '../components/icons/SaveIcon';
import { LogOutIcon } from '../components/icons/LogOutIcon';

interface SettingsPageProps {
  userProfile: HospitalProfile;
  onUpdateProfile: (profileData: Partial<HospitalProfile>) => void;
  onLogout: () => void;
  onBack: () => void;
}

const Label: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-600 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ userProfile, onUpdateProfile, onLogout, onBack }) => {
  const [formData, setFormData] = useState({
    hospitalId: userProfile.hospitalId,
    totalBeds: userProfile.totalBeds.toString(),
    totalErRooms: userProfile.totalErRooms.toString(),
    totalStaff: userProfile.totalStaff.toString(),
    avgPatientsPerDoctor: userProfile.avgPatientsPerDoctor?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = () => {
    onUpdateProfile({
        hospitalId: formData.hospitalId,
        totalBeds: parseInt(formData.totalBeds, 10),
        totalErRooms: parseInt(formData.totalErRooms, 10),
        totalStaff: parseInt(formData.totalStaff, 10),
        avgPatientsPerDoctor: formData.avgPatientsPerDoctor ? parseFloat(formData.avgPatientsPerDoctor) : null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="bg-white shadow-md sticky top-0 z-20 border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
            <button onClick={onBack} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition">
                Back to Dashboard
            </button>
        </div>
      </header>
      <main className="flex-grow p-4 lg:p-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          <Section title="Hospital Profile">
             <div>
                <Label htmlFor="hospitalId">Hospital Name</Label>
                <Input id="hospitalId" name="hospitalId" type="text" value={formData.hospitalId} onChange={handleChange} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="totalBeds">Total Beds</Label>
                    <Input id="totalBeds" name="totalBeds" type="number" value={formData.totalBeds} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="totalErRooms">Total ER Rooms</Label>
                    <Input id="totalErRooms" name="totalErRooms" type="number" value={formData.totalErRooms} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="totalStaff">Total Staff on Duty (Avg.)</Label>
                    <Input id="totalStaff" name="totalStaff" type="number" value={formData.totalStaff} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="avgPatientsPerDoctor">Avg. Patients per Doctor / Hour</Label>
                    <Input id="avgPatientsPerDoctor" name="avgPatientsPerDoctor" type="number" step="0.1" value={formData.avgPatientsPerDoctor} onChange={handleChange} />
                </div>
            </div>
          </Section>
          
          <Section title="Security">
            <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" name="current-password" type="password" placeholder="••••••••" />
            </div>
            <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" name="new-password" type="password" placeholder="••••••••" />
            </div>
          </Section>
          
          <div className="flex justify-between items-center gap-4">
             <button onClick={onLogout} className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">
                <LogOutIcon className="h-5 w-5"/>
                Logout
            </button>
            <button onClick={handleSaveChanges} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                <SaveIcon className="h-5 w-5" />
                Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};