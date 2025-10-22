import React, { useState } from 'react';
import { HospitalIcon } from '../components/icons/HospitalIcon';
import { LoadingSpinnerIcon } from '../components/icons/LoadingSpinnerIcon';

interface LoginPageProps {
  onLogin: (hospitalId: string) => void;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
);


export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId || !password) {
        alert("Please enter a Hospital ID and Password.");
        return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        onLogin(hospitalId);
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
            <HospitalIcon className="h-20 w-20 mx-auto text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800 mt-4">
                Hospital Operations Optimizer
            </h1>
            <p className="text-slate-500 mt-1">
                Sign in to access your dashboard.
            </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="hospitalId" className="block text-sm font-medium text-slate-600 mb-1">Hospital ID</label>
              <Input
                type="text"
                id="hospitalId"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                placeholder="e.g., General Hospital"
                required
              />
            </div>
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <Input
                type="password"
                id="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                  <>
                    <LoadingSpinnerIcon className="h-5 w-5 animate-spin" />
                    Signing In...
                  </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="text-center mt-6 text-sm text-slate-500">
            <p>For demonstration:</p>
            <p>Use any ID to log in as an existing hospital.</p>
            <p>Use an ID containing the word "new" to trigger the onboarding flow.</p>
        </div>
      </div>
    </div>
  );
};