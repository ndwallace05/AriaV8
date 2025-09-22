import React from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
    userProfile: UserProfile | null;
    isLoggedIn: boolean;
    onSignIn: () => void;
    onSignOut: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userProfile, isLoggedIn, onSignIn, onSignOut }) => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-700 mb-1">Google Account</h2>
        <p className="text-slate-500 mb-6">Connect your Google account to sync your calendar and tasks.</p>

        {isLoggedIn && userProfile ? (
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <img src={userProfile.picture} alt="User" className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-bold text-slate-800">{userProfile.name}</p>
                <p className="text-sm text-slate-500">{userProfile.email}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
             <button
              onClick={onSignIn}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" >
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.24,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
