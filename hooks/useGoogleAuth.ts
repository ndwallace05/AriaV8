import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { GOOGLE_CLIENT_ID } from '../config';

// Define the google object which comes from the GSI script
declare const google: any;

const USER_KEY = 'aria_google_user';

export const useGoogleAuth = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const isLoggedIn = !!userProfile;

    // Load user from localStorage on initial render
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_KEY);
            if (storedUser) {
                setUserProfile(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem(USER_KEY);
        }
    }, []);
    
    const handleCredentialResponse = useCallback((response: any) => {
        // The response.credential is a JWT (JSON Web Token)
        const idToken = response.credential;
        // You can decode the JWT to get user information
        const userObject = JSON.parse(atob(idToken.split('.')[1]));
        
        const profile: UserProfile = {
            name: userObject.name,
            email: userObject.email,
            picture: userObject.picture,
        };
        
        setUserProfile(profile);
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } catch (error) {
            console.error("Failed to save user to localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                use_fedcm_for_prompt: false,
            });
        }
    }, [handleCredentialResponse]);

    const signIn = useCallback(() => {
        if (typeof google !== 'undefined') {
             google.accounts.id.prompt();
        } else {
            console.error("Google Identity Services script not loaded.");
            alert("Could not connect to Google Sign-In. Please try again later.");
        }
    }, []);

    const signOut = useCallback(() => {
        setUserProfile(null);
        try {
            localStorage.removeItem(USER_KEY);
        } catch (error) {
            console.error("Failed to remove user from localStorage", error);
        }
        if (typeof google !== 'undefined') {
            google.accounts.id.disableAutoSelect();
        }
    }, []);

    return {
        userProfile,
        isLoggedIn,
        signIn,
        signOut,
    };
};