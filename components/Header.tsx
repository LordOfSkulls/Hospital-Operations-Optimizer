import React from 'react';
import { HospitalIcon } from './icons/HospitalIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import type { HospitalProfile } from '../types';

interface HeaderProps {
    userProfile?: HospitalProfile | null;
    onGoToSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userProfile, onGoToSettings }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-20 border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="text-blue-600">
                    <HospitalIcon className="h-12 w-12" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                    AI Hospital Operations Optimizer
                  </h1>
                </div>
            </div>
        </div>

        {userProfile && onGoToSettings && (
            <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                    <p className="font-semibold text-slate-700">{userProfile.hospitalId}</p>
                    <p className="text-xs text-slate-500">OPERATIONS DASHBOARD</p>
                </div>
                <button 
                    onClick={onGoToSettings}
                    className="flex items-center gap-2 p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Settings"
                >
                    <SettingsIcon className="h-5 w-5" />
                </button>
            </div>
        )}
      </div>
    </header>
  );
};