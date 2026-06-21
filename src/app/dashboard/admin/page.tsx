'use client';

import { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '@/providers/auth-provider';
import api from '@/lib/axios';
import {
  Activity,
  MapPin,
  Dumbbell,
  Heart,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Sliders
} from 'lucide-react';

export default function AdminPage() {
  const { refreshProfile, setProfile } = useAuth();

  // Profiles Directory State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [limit] = useState(5);
  const [offset, setOffset] = useState(0);

  // Modals & Detailed Views
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [profileToDeleteId, setProfileToDeleteId] = useState<string | null>(null); // null = myself, string = other userId

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null); // null = myself, string = other userId
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [editErrors, setEditErrors] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Load profiles
  const fetchProfiles = async () => {
    setProfilesLoading(true);
    try {
      const response = await api.get('/user-profiles', {
        params: { limit, offset }
      });
      setProfiles(response.data.data);
    } catch (err) {
      console.error('Failed to fetch profiles list', err);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [offset]);

  const handlePrevPage = () => {
    if (offset >= limit) {
      setOffset(prev => prev - limit);
    }
  };

  const handleNextPage = () => {
    if (profiles.length === limit) {
      setOffset(prev => prev + limit);
    }
  };

  // View specific profile details
  const handleViewProfile = async (targetUserId: string) => {
    try {
      const response = await api.get(`/user-profiles/${targetUserId}`);
      setSelectedProfile(response.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch detailed profile', err);
    }
  };

  // Open Edit Modal (prefill form)
  const openEditModal = (targetProfile: UserProfile, isSelf: boolean) => {
    setEditTargetId(isSelf ? null : targetProfile.userId);
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

      if (editTargetId === null) {
        await api.put('/user-profiles/me', payload);
        await refreshProfile();
      } else {
        await api.put(`/user-profiles/${editTargetId}`, payload);
      }
      await fetchProfiles();
      setIsEditOpen(false);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setEditErrors(err.response?.data?.message || 'Validation error. Please verify input formats.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Deletion Confirmation
  const confirmDelete = (targetUserId: string | null) => {
    setProfileToDeleteId(targetUserId);
    setIsDeleteConfirmOpen(true);
  };

  // Execute Deletion (DELETE)
  const handleDeleteProfile = async () => {
    try {
      if (profileToDeleteId === null) {
        await api.delete('/user-profiles/me');
        setProfile(null);
      } else {
        await api.delete(`/user-profiles/${profileToDeleteId}`);
        await fetchProfiles();
        setIsDeleteConfirmOpen(false);
      }
    } catch (err) {
      console.error('Failed to delete profile', err);
    }
  };

  return (
    <main className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">

        {/* Profiles Directory Card */}
        <div className="rounded-2xl border border-[#02306d]/40 bg-[#010226] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#0077b6]/5 blur-3xl pointer-events-none rounded-full" />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00b4d8]" />
              Profiles Directory (Admin Panel)
            </h2>
            <span className="text-xs bg-[#02306d]/30 text-[#00b4d8] px-3 py-1 rounded-full border border-[#00b4d8]/20 font-bold">
              Active Directory
            </span>
          </div>

          {profilesLoading ? (
            <div className="flex flex-col h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00b4d8] border-t-transparent" />
              <p className="text-xs text-[#ade8f4]/50 mt-3">Loading directory profiles...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-16 text-[#ade8f4]/40 text-sm">
              No other profiles found in the database.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-[#02306d]/30">
                <table className="min-w-full divide-y divide-[#02306d]/30 text-left text-xs">
                  <thead className="bg-[#010113]/85 text-[#ade8f4]/50 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Bio / Metrics</th>
                      <th className="px-6 py-4">Goal & Diet</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#02306d]/20 bg-[#010226]/50">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-[#020338]/30 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#02306d]/50 border border-[#00b4d8]/20 flex items-center justify-center font-bold text-white text-xs uppercase">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{p.firstName} {p.lastName}</p>
                              <p className="text-[10px] text-[#ade8f4]/45 capitalize">{p.gender}, {p.age} yrs</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white">{p.heightCm}cm / {p.weightKg}kg</p>
                          <p className="text-[10px] text-[#ade8f4]/45 mt-0.5">{p.city}, {p.country}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white capitalize">{p.goal?.replace('_', ' ') || 'N/A'}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase bg-[#0077b6]/20 text-[#00b4d8] px-2 py-0.5 rounded border border-[#00b4d8]/15">
                            {p?.dietType?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleViewProfile(p.userId)}
                              className="p-1.5 rounded-lg bg-[#02306d]/25 hover:bg-[#02306d]/50 text-[#ade8f4] transition"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(p, false)}
                              className="p-1.5 rounded-lg bg-[#0077b6]/20 hover:bg-[#0077b6]/45 text-[#90e0ef] transition"
                              title="Edit Profile"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(p.userId)}
                              className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 transition"
                              title="Delete Profile"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className="inline-flex items-center gap-1 text-xs text-[#ade8f4] hover:text-white disabled:opacity-30 disabled:pointer-events-none bg-[#010113]/70 border border-[#02306d]/40 rounded-lg px-3 py-1.5 transition"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <span className="text-[11px] text-[#ade8f4]/50 font-bold uppercase tracking-wider">
                  Offset: {offset}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={profiles.length < limit}
                  className="inline-flex items-center gap-1 text-xs text-[#ade8f4] hover:text-white disabled:opacity-30 disabled:pointer-events-none bg-[#010113]/70 border border-[#02306d]/40 rounded-lg px-3 py-1.5 transition"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* DETAILED VIEW MODAL */}
      {isDetailOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#010226] border border-[#02306d]/40 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 text-[#ade8f4]/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 border-b border-[#02306d]/30 pb-2">Profile Details</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-4 bg-[#010113] p-4 rounded-xl border border-[#02306d]/20">
                <div className="h-14 w-14 rounded-full bg-[#02306d] flex items-center justify-center font-bold text-white text-xl">
                  {selectedProfile.firstName[0]}{selectedProfile.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedProfile.firstName} {selectedProfile.lastName}</h3>
                  <p className="text-xs text-[#ade8f4]/60 capitalize">{selectedProfile.gender}, {selectedProfile.age} yrs</p>
                  <p className="text-[10px] text-[#ade8f4]/45">{selectedProfile.city}, {selectedProfile.state}, {selectedProfile.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#010113]/40 p-3 rounded-lg border border-[#02306d]/15">
                  <span className="text-[10px] text-[#ade8f4]/50 block uppercase tracking-wide">Height</span>
                  <span className="font-bold text-white text-sm">{selectedProfile.heightCm} cm</span>
                </div>
                <div className="bg-[#010113]/40 p-3 rounded-lg border border-[#02306d]/15">
                  <span className="text-[10px] text-[#ade8f4]/50 block uppercase tracking-wide">Weight</span>
                  <span className="font-bold text-white text-sm">{selectedProfile.weightKg} kg</span>
                </div>
                {selectedProfile.targetWeightKg && (
                  <div className="bg-[#010113]/40 p-3 rounded-lg border border-[#02306d]/15">
                    <span className="text-[10px] text-[#ade8f4]/50 block uppercase tracking-wide">Target Weight</span>
                    <span className="font-bold text-white text-sm">{selectedProfile.targetWeightKg} kg</span>
                  </div>
                )}
                {selectedProfile.targetCalories && (
                  <div className="bg-[#010113]/40 p-3 rounded-lg border border-[#02306d]/15">
                    <span className="text-[10px] text-[#ade8f4]/50 block uppercase tracking-wide">Target Calories</span>
                    <span className="font-bold text-white text-sm">{selectedProfile.targetCalories} kcal</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-[#02306d]/30 pt-4 text-xs">
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Activity Level:</span><span className="font-bold text-white capitalize">{selectedProfile.activityLevel?.replace('_', ' ') || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Goal:</span><span className="font-bold text-white capitalize">{selectedProfile.goal?.replace('_', ' ') || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Diet Type:</span><span className="font-bold text-white capitalize">{selectedProfile?.dietType?.replace('_', ' ') || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Sleep Hours:</span><span className="font-bold text-white">{selectedProfile.sleepHours || 'N/A'} hrs</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Workouts / Week:</span><span className="font-bold text-white">{selectedProfile.workoutDaysPerWeek || '0'} days</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Occupation:</span><span className="font-bold text-white capitalize">{selectedProfile.occupation || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Smoking habit:</span><span className="font-bold text-white capitalize">{selectedProfile.smoking ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-[#ade8f4]/60">Alcohol consumption:</span><span className="font-bold text-white capitalize">{selectedProfile.alcohol ? 'Yes' : 'No'}</span></div>
              </div>

              {/* Arrays */}
              {selectedProfile.allergies.length > 0 && (
                <div className="border-t border-[#02306d]/30 pt-3">
                  <p className="text-[10px] uppercase font-bold text-[#ade8f4]/55 tracking-wider mb-1.5">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.allergies.map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-red-950/40 border border-red-500/25 text-red-200 px-2 py-0.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.dislikedFoods.length > 0 && (
                <div className="border-t border-[#02306d]/30 pt-3">
                  <p className="text-[10px] uppercase font-bold text-[#ade8f4]/55 tracking-wider mb-1.5">Disliked Foods</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.dislikedFoods.map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-orange-950/30 border border-orange-500/20 text-orange-200 px-2 py-0.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              Edit Profile {editTargetId === null ? '(Myself)' : '(Directory User)'}
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
              Are you absolutely sure you want to delete this user profile? This action is permanent and cannot be undone.
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
