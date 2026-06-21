'use client';

import { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '@/providers/auth-provider';
import api from '@/lib/axios';
import {
  User,
  Activity,
  MapPin,
  Dumbbell,
  Heart,
  Edit3,
  Trash2,
  X,
  Sliders,
  Sparkles,
  ShieldAlert,
  Info,
  Calendar,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, refreshProfile, setProfile } = useAuth();

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTargetId] = useState<string | null>(null); // always null for self
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [editErrors, setEditErrors] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Open Edit Modal (prefill form)
  const openEditModal = (targetProfile: UserProfile) => {
    setEditFormData({
      firstName: targetProfile.firstName,
      lastName: targetProfile.lastName,
      age: targetProfile.age,
      gender: targetProfile.gender,
      heightCm: targetProfile.heightCm,
      weightKg: targetProfile.weightKg,
      targetWeightKg: targetProfile.targetWeightKg,
      waistCm: targetProfile.waistCm,
      bodyFatPercentage: targetProfile.bodyFatPercentage,
      activityLevel: targetProfile.activityLevel,
      goal: targetProfile.goal,
      targetCalories: targetProfile.targetCalories,
      dietType: targetProfile.dietType,
      sleepHours: targetProfile.sleepHours,
      workoutDaysPerWeek: targetProfile.workoutDaysPerWeek,
      occupation: targetProfile.occupation,
      country: targetProfile.country,
      state: targetProfile.state,
      city: targetProfile.city,
    });
    setIsEditOpen(true);
    setEditErrors(null);
  };

  // Submit profile updates (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditErrors(null);

    try {
      const payload = {
        ...editFormData,
        age: editFormData.age ? parseInt(String(editFormData.age)) : undefined,
        heightCm: editFormData.heightCm ? parseFloat(String(editFormData.heightCm)) : undefined,
        weightKg: editFormData.weightKg ? parseFloat(String(editFormData.weightKg)) : undefined,
        targetWeightKg: editFormData.targetWeightKg ? parseFloat(String(editFormData.targetWeightKg)) : null,
        waistCm: editFormData.waistCm ? parseFloat(String(editFormData.waistCm)) : null,
        bodyFatPercentage: editFormData.bodyFatPercentage ? parseFloat(String(editFormData.bodyFatPercentage)) : null,
        sleepHours: editFormData.sleepHours ? parseFloat(String(editFormData.sleepHours)) : null,
        workoutDaysPerWeek: editFormData.workoutDaysPerWeek ? parseInt(String(editFormData.workoutDaysPerWeek)) : null,
        targetCalories: editFormData.targetCalories ? parseInt(String(editFormData.targetCalories)) : null,
      };

      await api.put('/user-profiles/me', payload);
      await refreshProfile();
      setIsEditOpen(false);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setEditErrors(err.response?.data?.message || 'Validation error. Please verify input formats.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Execute Deletion (DELETE)
  const handleDeleteProfile = async () => {
    try {
      await api.delete('/user-profiles/me');
      setProfile(null); // Triggers protected redirect to setup
    } catch (err) {
      console.error('Failed to delete profile', err);
    }
  };

  // Get goal-specific insight text
  const getGoalInsight = (goal: string) => {
    switch (goal) {
      case 'lose_weight':
        return 'To lose weight, focus on a healthy calorie deficit, intake of high-volume foods, and consistent resistance training to preserve lean muscle mass.';
      case 'gain_muscle':
        return 'To build muscle, ensure you eat in a slight calorie surplus, hit your daily protein requirements, and follow a progressive overload workout plan.';
      case 'gain_weight':
        return 'To gain weight safely, focus on consuming energy-dense foods, healthy fats, and spacing out meals consistently throughout the day.';
      case 'maintain':
      default:
        return 'To maintain your current fitness level, balance your daily calorie intake with expenditure and keep a regular workout routine.';
    }
  };

  // Calculate weight progress percentage
  const getWeightProgressPercent = () => {
    if (!profile || !profile.targetWeightKg) return 0;
    const diff = Math.abs(profile.weightKg - profile.targetWeightKg);
    if (diff === 0) return 100;
    const pct = Math.max(0, Math.min(100, Math.round(((profile.weightKg - diff) / profile.weightKg) * 100)));
    return pct;
  };

  return (
    <main className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Welcome Panel (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Welcome Card */}
          <div className="rounded-2xl border border-[#02306d]/40 bg-gradient-to-r from-[#010226] to-[#01053b] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-48 w-48 bg-[#00b4d8]/10 blur-3xl pointer-events-none rounded-full animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Welcome back, <span className="text-[#00b4d8]">{profile?.firstName || user?.name}!</span>
            </h1>
            <p className="text-sm text-[#ade8f4]/70 mt-2 max-w-lg">
              Here is your nutritional summary and goals for today. Keep tracking to maintain a healthy lifestyle.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => profile && openEditModal(profile)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0077b6] hover:bg-[#0096c7] text-white px-4 py-2 text-xs font-bold transition shadow-lg shadow-[#0077b6]/25"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Update Metrics
              </button>
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#02306d]/60 bg-[#010113] hover:bg-[#02306d]/30 text-[#ade8f4] px-4 py-2 text-xs font-bold transition"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                View Admin Panel
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#010226] border border-[#02306d]/30 p-4 rounded-xl text-center shadow-md">
              <p className="text-[10px] font-bold text-[#ade8f4]/45 uppercase tracking-wider">Calories Goal</p>
              <p className="text-xl font-black text-white mt-1">{profile?.targetCalories || 'N/A'} <span className="text-xs font-medium text-[#ade8f4]/60">kcal</span></p>
            </div>

            <div className="bg-[#010226] border border-[#02306d]/30 p-4 rounded-xl text-center shadow-md">
              <p className="text-[10px] font-bold text-[#ade8f4]/45 uppercase tracking-wider">Diet Type</p>
              <p className="text-sm font-bold text-[#90e0ef] mt-2 capitalize">{profile?.dietType?.replace('_', ' ') || 'N/A'}</p>
            </div>

            <div className="bg-[#010226] border border-[#02306d]/30 p-4 rounded-xl text-center shadow-md">
              <p className="text-[10px] font-bold text-[#ade8f4]/45 uppercase tracking-wider">Activity Level</p>
              <p className="text-sm font-bold text-[#90e0ef] mt-2 capitalize">{profile?.activityLevel?.replace('_', ' ') || 'N/A'}</p>
            </div>

            <div className="bg-[#010226] border border-[#02306d]/30 p-4 rounded-xl text-center shadow-md">
              <p className="text-[10px] font-bold text-[#ade8f4]/45 uppercase tracking-wider">Workouts / Week</p>
              <p className="text-xl font-black text-white mt-1">{profile?.workoutDaysPerWeek || '0'} <span className="text-xs font-medium text-[#ade8f4]/60">days</span></p>
            </div>
          </div>

          {/* Weight progress tracking */}
          {profile && profile.targetWeightKg && (
            <div className="bg-[#010226] border border-[#02306d]/30 p-6 rounded-2xl shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#00b4d8]" />
                  Weight Goal Progress
                </h3>
                <span className="text-xs bg-[#0077b6]/20 text-[#00b4d8] px-2 py-0.5 rounded border border-[#00b4d8]/20 font-bold">
                  {getWeightProgressPercent()}% Completed
                </span>
              </div>
              <div className="w-full bg-[#010113] rounded-full h-2.5 border border-[#02306d]/40">
                <div
                  className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getWeightProgressPercent()}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-[#ade8f4]/50 mt-2">
                <span>Current: {profile.weightKg} kg</span>
                <span>Target: {profile.targetWeightKg} kg</span>
              </div>
            </div>
          )}

          {/* Tips and Insights Card */}
          {profile && (
            <div className="bg-[#010226] border border-[#02306d]/30 p-6 rounded-2xl relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 h-16 w-16 bg-[#00b4d8]/5 blur-xl pointer-events-none rounded-full" />
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-[#02306d]/40 border border-[#00b4d8]/30 rounded-xl text-[#00b4d8]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Goal Insight: {(profile.goal || 'maintain').replace('_', ' ').toUpperCase()}</h3>
                  <p className="text-xs text-[#ade8f4]/70 mt-1 leading-relaxed">
                    {getGoalInsight(profile.goal)}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: My Profile (lg:col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-[#02306d]/40 bg-[#010226] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00b4d8]/5 blur-2xl pointer-events-none rounded-full" />

            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <User className="h-4 w-4 text-[#00b4d8]" />
                My Profile
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => profile && openEditModal(profile)}
                  className="p-2 rounded-lg bg-[#02306d]/35 hover:bg-[#0077b6]/30 text-[#00b4d8] border border-[#00b4d8]/20 transition"
                  title="Edit Profile"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-500/20 transition"
                  title="Delete Profile"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {profile && (
              <div className="space-y-6">
                {/* Header Basic Details */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#023e8a] to-[#00b4d8] flex items-center justify-center text-white text-2xl font-black uppercase shadow-md shadow-[#00b4d8]/10 border border-[#90e0ef]/20">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{profile.firstName} {profile.lastName}</h3>
                    <p className="text-xs text-[#ade8f4]/60 capitalize">{profile.gender}, {profile.age} years old</p>
                    <p className="text-[10px] text-[#ade8f4]/45 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-[#00b4d8]" />
                      {profile.city}, {profile.state}, {profile.country}
                    </p>
                  </div>
                </div>

                {/* Key Stats Grids */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#02306d]/30">
                  <div className="bg-[#010113]/60 p-3 rounded-xl border border-[#02306d]/20 text-center">
                    <p className="text-[10px] font-bold text-[#ade8f4]/40 uppercase tracking-wider">Height</p>
                    <p className="text-lg font-bold text-[#e9f9fc] mt-1">{profile.heightCm} <span className="text-xs font-normal text-[#ade8f4]/60">cm</span></p>
                  </div>
                  <div className="bg-[#010113]/60 p-3 rounded-xl border border-[#02306d]/20 text-center">
                    <p className="text-[10px] font-bold text-[#ade8f4]/40 uppercase tracking-wider">Weight</p>
                    <p className="text-lg font-bold text-[#e9f9fc] mt-1">{profile.weightKg} <span className="text-xs font-normal text-[#ade8f4]/60">kg</span></p>
                  </div>
                  {profile.targetWeightKg && (
                    <div className="bg-[#010113]/60 p-3 rounded-xl border border-[#02306d]/20 text-center">
                      <p className="text-[10px] font-bold text-[#ade8f4]/40 uppercase tracking-wider">Target Weight</p>
                      <p className="text-lg font-bold text-[#00b4d8] mt-1">{profile.targetWeightKg} <span className="text-xs font-normal text-[#ade8f4]/60">kg</span></p>
                    </div>
                  )}
                  {profile.targetCalories && (
                    <div className="bg-[#010113]/60 p-3 rounded-xl border border-[#02306d]/20 text-center col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-[#ade8f4]/40 uppercase tracking-wider">Target Calories</p>
                      <p className="text-lg font-bold text-[#90e0ef] mt-1">{profile.targetCalories} <span className="text-xs font-normal text-[#ade8f4]/60">kcal</span></p>
                    </div>
                  )}
                </div>

                {/* Detailed Properties */}
                <div className="space-y-3 pt-4 border-t border-[#02306d]/30 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5 text-[#00b4d8]" />Goal</span>
                    <span className="font-semibold text-white capitalize">{profile.goal?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#00b4d8]" />Diet Type</span>
                    <span className="font-semibold text-[#ade8f4] capitalize">{profile?.dietType?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5 text-[#00b4d8]" />Activity Level</span>
                    <span className="font-semibold text-[#ade8f4] capitalize">{profile.activityLevel?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  {profile.workoutDaysPerWeek !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#ade8f4]/50">Workouts / Week</span>
                      <span className="font-semibold text-white">{profile.workoutDaysPerWeek} days</span>
                    </div>
                  )}
                </div>

                {/* Arrays chips */}
                {profile.allergies.length > 0 && (
                  <div className="pt-4 border-t border-[#02306d]/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#ade8f4]/40 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.allergies.map((val, idx) => (
                        <span key={idx} className="text-[10px] bg-red-950/40 border border-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full">{val}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#010226] border border-[#02306d]/40 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-[#ade8f4]/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 border-b border-[#02306d]/30 pb-2">
              Edit Profile (Myself)
            </h2>

            {editErrors && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/35 rounded-xl text-red-200 text-xs">
                {editErrors}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editFormData.gender || 'male'}
                    onChange={e => setEditFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="heightCm"
                    value={editFormData.heightCm || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, heightCm: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weightKg"
                    value={editFormData.weightKg || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, weightKg: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="targetWeightKg"
                    value={editFormData.targetWeightKg || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, targetWeightKg: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Target Calories (kcal)</label>
                  <input
                    type="number"
                    name="targetCalories"
                    value={editFormData.targetCalories || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, targetCalories: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Goal</label>
                  <select
                    name="goal"
                    value={editFormData.goal || 'maintain'}
                    onChange={e => setEditFormData(prev => ({ ...prev, goal: e.target.value as any }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain_muscle">Gain Muscle</option>
                    <option value="gain_weight">Gain Weight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={editFormData.activityLevel || 'moderate'}
                    onChange={e => setEditFormData(prev => ({ ...prev, activityLevel: e.target.value as any }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Diet Type</label>
                  <select
                    name="dietType"
                    value={editFormData.dietType || 'non_vegetarian'}
                    onChange={e => setEditFormData(prev => ({ ...prev, dietType: e.target.value as any }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="eggetarian">Eggetarian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#ade8f4]/70 uppercase mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="waistCm"
                    value={editFormData.waistCm || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, waistCm: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00b4d8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#02306d]/30 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="border border-[#02306d]/40 bg-transparent text-[#ade8f4] hover:text-white rounded-xl px-4 py-2 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="bg-[#023e8a] hover:bg-[#0077b6] text-white rounded-xl px-5 py-2 text-sm font-semibold transition disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#010226] border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center">
            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />

            <h3 className="text-lg font-bold text-white mb-2">Delete Profile</h3>
            <p className="text-xs text-[#ade8f4]/60 mb-6 leading-relaxed">
              Are you absolutely sure you want to delete your profile? This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-transparent border border-[#02306d]/40 text-[#ade8f4] hover:text-white rounded-xl px-4 py-2 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteProfile();
                  setIsDeleteConfirmOpen(false);
                }}
                className="bg-red-650 hover:bg-red-650/80 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-xs font-semibold transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
