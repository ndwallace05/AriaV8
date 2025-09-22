import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../types';
import { GOOGLE_CLIENT_ID } from '../config';

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/tasks.readonly',
    'https://www.googleapis.com/auth/tasks',
].join(' ');

/**
 * A custom hook to manage Google OAuth2 authentication.
 * It handles loading the Google API scripts, user login/logout,
 * and storing the access token and user profile.
 * @returns {{
 *  isApiReady: boolean,
 *  isLoggedIn: boolean,
 *  accessToken: string | null,
 *  userProfile: UserProfile | null,
 *  login: () => void,
 *  logout: () => void
 * }} An object containing authentication state and functions.
 */
export const useGoogleAuth = () => {
    const [isApiReady, setIsApiReady] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const tokenClient = useRef<any>(null);

    const handleAuthResult = useCallback(async (tokenResponse: any) => {
        if (tokenResponse.access_token) {
            setAccessToken(tokenResponse.access_token);
            localStorage.setItem('g_access_token', tokenResponse.access_token);
            // Fetch user profile
            try {
                const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                });
                if (profileResponse.ok) {
                    const profile = await profileResponse.json();
                    const user: UserProfile = {
                        name: profile.name,
                        email: profile.email,
                        picture: profile.picture,
                    };
                    setUserProfile(user);
                    localStorage.setItem('g_user_profile', JSON.stringify(user));
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        }
    }, []);

    useEffect(() => {
        // Load Google API script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            (window as any).gapi.load('client', async () => {
                await (window as any).gapi.client.init({});
                // Now load GIS script
                const gisScript = document.createElement('script');
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.async = true;
                gisScript.defer = true;
                gisScript.onload = () => {
                    tokenClient.current = (window as any).google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: SCOPES,
                        callback: handleAuthResult,
                    });
                    setIsApiReady(true);

                    // Check for existing token
                    const storedToken = localStorage.getItem('g_access_token');
                    const storedProfile = localStorage.getItem('g_user_profile');
                    if (storedToken && storedProfile) {
                        setAccessToken(storedToken);
                        setUserProfile(JSON.parse(storedProfile));
                    }
                };
                document.body.appendChild(gisScript);
            });
        };
        document.body.appendChild(script);
    }, [handleAuthResult]);

    const login = () => {
        if (tokenClient.current) {
            // Prompt for consent if needed
            tokenClient.current.requestAccessToken({prompt: 'consent'});
        } else {
            console.error("Google Token Client not initialized.");
        }
    };

    const logout = () => {
        setAccessToken(null);
        setUserProfile(null);
        localStorage.removeItem('g_access_token');
        localStorage.removeItem('g_user_profile');
        if (accessToken) {
            (window as any).google?.accounts.oauth2.revoke(accessToken, () => {
                console.log('Token revoked');
            });
        }
    };

    return {
        isApiReady,
        isLoggedIn: !!accessToken,
        accessToken,
        userProfile,
        login,
        logout,
    };
};
