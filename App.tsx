import React, { useState, useCallback } from 'react';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AuthState, HospitalProfile } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [userProfile, setUserProfile] = useState<HospitalProfile | null>(null);

  const handleLogin = useCallback((hospitalId: string) => {
    if (hospitalId.toLowerCase().includes('new')) {
       setUserProfile({ 
        hospitalId,
        totalBeds: 0,
        totalErRooms: 0,
        totalStaff: 0,
        avgPatientsPerDoctor: null,
      });
      setAuthState('onboarding');
    } else {
       setUserProfile({ 
        hospitalId: 'General Hospital',
        totalBeds: 500,
        totalErRooms: 20,
        totalStaff: 450,
        avgPatientsPerDoctor: 2.5,
      });
      setAuthState('dashboard');
    }
  }, []);
  
  const handleOnboardingComplete = useCallback((profileData: Omit<HospitalProfile, 'hospitalId'>) => {
    setUserProfile(prev => {
        if (!prev) return null;
        const updatedProfile = { ...prev, ...profileData };
        console.log("Onboarding complete, profile saved:", updatedProfile);
        return updatedProfile;
    });
    setAuthState('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setUserProfile(null);
    setAuthState('login');
  }, []);

  const handleGoToSettings = useCallback(() => {
    setAuthState('settings');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setAuthState('dashboard');
  }, []);

  const handleUpdateProfile = useCallback((updatedProfileData: Partial<HospitalProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const newProfile = { ...prev, ...updatedProfileData };
      console.log("Profile updated:", newProfile);
      // In a real app, you would save this to the backend.
      return newProfile;
    });
    alert("Profile updated successfully!");
  }, []);

  const renderContent = () => {
    switch (authState) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'onboarding':
        if (userProfile) {
          return <OnboardingPage userProfile={userProfile} onOnboardingComplete={handleOnboardingComplete} />;
        }
        setAuthState('login');
        return <LoginPage onLogin={handleLogin} />;
      case 'dashboard':
        if (userProfile) {
          return <DashboardPage userProfile={userProfile} onLogout={handleLogout} onGoToSettings={handleGoToSettings} />;
        }
        setAuthState('login');
        return <LoginPage onLogin={handleLogin} />;
      case 'settings':
         if (userProfile) {
          return <SettingsPage userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} onBack={handleBackToDashboard} />;
        }
        setAuthState('login');
        return <LoginPage onLogin={handleLogin} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {renderContent()}
    </div>
  );
};

export default App;