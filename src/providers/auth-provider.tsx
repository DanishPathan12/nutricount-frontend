'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  setUser as setUserAction,
  setProfile as setProfileAction,
  clearUser as clearUserAction,
  fetchUserProfile
} from '@/redux/userSlice';

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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const profile = useAppSelector((state) => state.user.profile);
  const profileLoading = useAppSelector((state) => state.user.loading);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  console.log('user', user);
  console.log('profile', profile);



  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      dispatch(setUserAction(response.data.user));

      // Fetch user profile via Redux
      await dispatch(fetchUserProfile());
    } catch (error) {
      dispatch(clearUserAction());
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (idToken: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', { idToken });
      const { user: loggedInUser, accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      dispatch(setUserAction(loggedInUser));

      // Dynamic header mapping
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Check user profile
      const profileResult = await dispatch(fetchUserProfile()).unwrap();

      if (profileResult) {
        router.push('/dashboard');
      } else {
        router.push('/profile/setup');
      }
    } catch (error) {
      console.error('Login failed', error);
      dispatch(clearUserAction());
      localStorage.removeItem('accessToken');
      throw error;
    } finally {
      setIsLoading(false);
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
      dispatch(clearUserAction());
      setIsLoading(false);
      router.push('/login');
    }
  };

  const sendOtp = async (email: string) => {
    await api.post('/auth/otp/send', { email });
  };

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/otp/verify', { email, code });
      const { user: loggedInUser, accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      dispatch(setUserAction(loggedInUser));

      // Dynamic header mapping
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Check user profile
      const profileResult = await dispatch(fetchUserProfile()).unwrap();

      if (profileResult) {
        router.push('/dashboard');
      } else {
        router.push('/profile/setup');
      }
    } catch (error) {
      console.error('OTP Verification failed', error);
      dispatch(clearUserAction());
      localStorage.removeItem('accessToken');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      console.error('Failed to refresh profile', error);
    }
  };

  const setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>> = (value) => {
    if (typeof value === 'function') {
      const newValue = (value as Function)(profile);
      dispatch(setProfileAction(newValue));
    } else {
      dispatch(setProfileAction(value));
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
