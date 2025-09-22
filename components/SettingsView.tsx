import React from 'react';
import { UserProfile } from '../types';
import { ICONS } from '../constants';

interface SettingsViewProps {
    isApiReady: boolean;
    isLoggedIn: boolean;
    userProfile: UserProfile | null;
    login: () => void;
    logout: () => void;
}

/**
 * Renders the settings view, which allows users to connect or disconnect their Google account.
 * @param {SettingsViewProps} props The component props.
 * @param {boolean} props.isApiReady Whether the Google API is ready to be used.
 * @param {boolean} props.isLoggedIn Whether the user is currently logged in.
 * @param {UserProfile | null} props.userProfile The user's Google profile information.
 * @param {() => void} props.login The function to initiate the login process.
 * @param {() => void} props.logout The function to initiate the logout process.
 * @returns {React.ReactElement} The rendered settings view.
 */
const SettingsView: React.FC<SettingsViewProps> = ({ isApiReady, isLoggedIn, userProfile, login, logout }) => {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Google Account Sync</h2>
                    {isLoggedIn && userProfile ? (
                        <div className="flex items-center space-x-4">
                            <img src={userProfile.picture} alt="User" className="w-16 h-16 rounded-full" />
                            <div>
                                <p className="font-bold text-slate-800 text-lg">{userProfile.name}</p>
                                <p className="text-slate-500">{userProfile.email}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="ml-auto px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-slate-600 mb-6">
                                Connect your Google Account to sync your Calendar, Email, and Tasks with Aria. This will allow Aria to manage your schedule, read your emails, and update your to-do lists on your behalf.
                            </p>
                            <button
                                onClick={login}
                                disabled={!isApiReady}
                                className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 font-semibold shadow-md disabled:bg-sky-300 disabled:cursor-not-allowed"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.23,4.14-4.082,5.571l6.19,5.238C42.02,35.62,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
