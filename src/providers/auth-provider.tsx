'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number | null;
  waistCm?: number | null;
  bodyFatPercentage?: number | null;
  country: string;
  state: string;
  city: string;
  ethnicity?: string | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  occupation?: string | null;
  workoutDaysPerWeek?: number | null;
  sleepHours?: number | null;
  goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'gain_weight';
  targetCalories?: number | null;
  dietType: 'vegetarian' | 'vegan' | 'non_vegetarian' | 'eggetarian';
  allergies: string[];
  dislikedFoods: string[];
  preferredCuisine: string[];
  conditions: string[];
  medications: string[];
  smoking: boolean;
  alcohol: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  profileLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);

      // Now fetch user profile
      try {
        const profileResponse = await api.get('/user-profiles/me');
        setProfile(profileResponse.data.data);
      } catch (profileError: any) {
        if (profileError.response?.status === 404) {
          setProfile(null);
        } else {
          console.error('Failed to fetch profile', profileError);
        }
      }
    } catch (error) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      checkAuth();
    } else {
      setIsLoading(false);
      setProfileLoading(false);
    }
  }, []);

  const login = async (idToken: string) => {
    setIsLoading(true);
    setProfileLoading(true);
    try {
      const response = await api.post('/auth/google', { idToken });
      const { user: loggedInUser, accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(loggedInUser);

      // Dynamic header mapping
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      
      // Check user profile
      let userProfile: UserProfile | null = null;
      try {
        const profileResponse = await api.get('/user-profiles/me');
        userProfile = profileResponse.data.data;
        setProfile(userProfile);
      } catch (profileError: any) {
        if (profileError.response?.status === 404) {
          setProfile(null);
        } else {
          console.error('Failed to fetch profile', profileError);
        }
      }

      if (userProfile) {
        router.push('/dashboard');
      } else {
        router.push('/profile/setup');
      }
    } catch (error) {
      console.error('Login failed', error);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
      throw error;
    } finally {
      setIsLoading(false);
      setProfileLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  const sendOtp = async (email: string) => {
    await api.post('/auth/otp/send', { email });
  };

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    setProfileLoading(true);
    try {
      const response = await api.post('/auth/otp/verify', { email, code });
      const { user: loggedInUser, accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(loggedInUser);

      // Dynamic header mapping
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      
      // Check user profile
      let userProfile: UserProfile | null = null;
      try {
        const profileResponse = await api.get('/user-profiles/me');
        userProfile = profileResponse.data.data;
        setProfile(userProfile);
      } catch (profileError: any) {
        if (profileError.response?.status === 404) {
          setProfile(null);
        } else {
          console.error('Failed to fetch profile', profileError);
        }
      }

      if (userProfile) {
        router.push('/dashboard');
      } else {
        router.push('/profile/setup');
      }
    } catch (error) {
      console.error('OTP Verification failed', error);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
      throw error;
    } finally {
      setIsLoading(false);
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await api.get('/user-profiles/me');
      setProfile(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        console.error('Failed to refresh profile', error);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        profileLoading,
        login,
        logout,
        sendOtp,
        verifyOtp,
        isAuthenticated: !!user,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
