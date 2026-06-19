'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Dumbbell, 
  Heart, 
  Utensils, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  X, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface FormErrors {
  [key: string]: string;
}

export default function ProfileSetupPage() {
  const { user, setProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    dateOfBirth: '',
    heightCm: '',
    weightKg: '',
    targetWeightKg: '',
    waistCm: '',
    bodyFatPercentage: '',
    country: 'USA',
    state: '',
    city: '',
    ethnicity: '',
    activityLevel: 'moderate',
    occupation: '',
    workoutDaysPerWeek: '',
    sleepHours: '',
    goal: 'maintain',
    targetCalories: '',
    dietType: 'non_vegetarian',
    allergies: [] as string[],
    dislikedFoods: [] as string[],
    preferredCuisine: [] as string[],
    conditions: [] as string[],
    medications: [] as string[],
    smoking: false,
    alcohol: false,
  });

  // Chip input temp values
  const [allergyInput, setAllergyInput] = useState('');
  const [dislikedInput, setDislikedInput] = useState('');
  const [cuisineInput, setCuisineInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddChip = (field: 'allergies' | 'dislikedFoods' | 'preferredCuisine' | 'conditions' | 'medications', value: string, setter: (val: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !formData[field].includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], trimmed]
      }));
      setter('');
    }
  };

  const handleRemoveChip = (field: 'allergies' | 'dislikedFoods' | 'preferredCuisine' | 'conditions' | 'medications', indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Step validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
          newErrors.age = 'Age must be between 13 and 120';
        }
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
    }

    if (currentStep === 2) {
      if (!formData.heightCm) {
        newErrors.heightCm = 'Height is required';
      } else {
        const h = parseFloat(formData.heightCm);
        if (isNaN(h) || h < 50 || h > 300) newErrors.heightCm = 'Height must be between 50 and 300 cm';
      }

      if (!formData.weightKg) {
        newErrors.weightKg = 'Weight is required';
      } else {
        const w = parseFloat(formData.weightKg);
        if (isNaN(w) || w < 20 || w > 500) newErrors.weightKg = 'Weight must be between 20 and 500 kg';
      }

      if (formData.targetWeightKg) {
        const tw = parseFloat(formData.targetWeightKg);
        if (isNaN(tw) || tw < 20 || tw > 500) newErrors.targetWeightKg = 'Target weight must be between 20 and 500 kg';
      }

      if (formData.waistCm) {
        const waist = parseFloat(formData.waistCm);
        if (isNaN(waist) || waist < 30 || waist > 200) newErrors.waistCm = 'Waist must be between 30 and 200 cm';
      }

      if (formData.bodyFatPercentage) {
        const bf = parseFloat(formData.bodyFatPercentage);
        if (isNaN(bf) || bf < 0 || bf > 100) newErrors.bodyFatPercentage = 'Body fat must be between 0% and 100%';
      }
    }

    if (currentStep === 3) {
      if (formData.workoutDaysPerWeek) {
        const wDays = parseInt(formData.workoutDaysPerWeek);
        if (isNaN(wDays) || wDays < 0 || wDays > 7) newErrors.workoutDaysPerWeek = 'Days must be between 0 and 7';
      }
      if (formData.sleepHours) {
        const sleep = parseFloat(formData.sleepHours);
        if (isNaN(sleep) || sleep < 0 || sleep > 24) newErrors.sleepHours = 'Hours must be between 0 and 24';
      }
      if (formData.targetCalories) {
        const cal = parseInt(formData.targetCalories);
        if (isNaN(cal) || cal < 500 || cal > 10000) newErrors.targetCalories = 'Calories must be between 500 and 10,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      // Parse data to match backend types
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        heightCm: parseFloat(formData.heightCm),
        weightKg: parseFloat(formData.weightKg),
        targetWeightKg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : null,
        waistCm: formData.waistCm ? parseFloat(formData.waistCm) : null,
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : null,
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        ethnicity: formData.ethnicity.trim() || null,
        activityLevel: formData.activityLevel,
        occupation: formData.occupation.trim() || null,
        workoutDaysPerWeek: formData.workoutDaysPerWeek ? parseInt(formData.workoutDaysPerWeek) : null,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        goal: formData.goal,
        targetCalories: formData.targetCalories ? parseInt(formData.targetCalories) : null,
        dietType: formData.dietType,
        allergies: formData.allergies,
        dislikedFoods: formData.dislikedFoods,
        preferredCuisine: formData.preferredCuisine,
        conditions: formData.conditions,
        medications: formData.medications,
        smoking: formData.smoking,
        alcohol: formData.alcohol,
      };

      const response = await api.post('/user-profiles', payload);
      setProfile(response.data.data);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to create profile', err);
      const apiMessage = err.response?.data?.message || 'Failed to save profile. Please check validation rules.';
      setErrors({ apiError: apiMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#010113] py-12 px-4 sm:px-6 lg:px-8 text-[#e9f9fc]">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Complete Your <span className="bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="mt-3 text-sm text-[#ade8f4]/60">
              Welcome, {user?.name}! Let's customize Nutricount to match your specific health goals.
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="mb-10">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-[#ade8f4]/40 uppercase mb-3">
              <span>Step {step} of 4</span>
              <span>{Math.round(((step - 1) / 3) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-[#010226] rounded-full overflow-hidden border border-[#02306d]/20">
              <div 
                className="h-full bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] transition-all duration-300"
                style={{ width: `${((step) / 4) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 text-center text-[10px] font-bold uppercase tracking-wider">
              <span className={step >= 1 ? 'text-[#00b4d8]' : 'text-[#ade8f4]/35'}>Identity</span>
              <span className={step >= 2 ? 'text-[#00b4d8]' : 'text-[#ade8f4]/35'}>Metrics</span>
              <span className={step >= 3 ? 'text-[#00b4d8]' : 'text-[#ade8f4]/35'}>Lifestyle</span>
              <span className={step >= 4 ? 'text-[#00b4d8]' : 'text-[#ade8f4]/35'}>Diet & Health</span>
            </div>
          </div>

          {/* Form Box */}
          <div className="bg-[#010226] border border-[#02306d]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#0077b6]/5 blur-3xl pointer-events-none rounded-full" />
            
            {errors.apiError && (
              <div className="mb-6 p-4 bg-red-950/45 border border-red-500/35 rounded-xl text-red-200 text-sm">
                {errors.apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: IDENTITY & DEMOGRAPHICS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#02306d]/30 pb-3">
                    <User className="h-5 w-5 text-[#00b4d8]" />
                    <h2 className="text-lg font-bold text-white">Identity & Demographics</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">First Name *</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="John"
                      />
                      {errors.firstName && <p className="mt-1.5 text-xs text-red-400">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Last Name *</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="mt-1.5 text-xs text-red-400">{errors.lastName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Age *</label>
                      <input 
                        type="number" 
                        name="age" 
                        value={formData.age} 
                        onChange={handleChange}
                        min="13" 
                        max="120"
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="28"
                      />
                      {errors.age && <p className="mt-1.5 text-xs text-red-400">{errors.age}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Gender *</label>
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Date of Birth *</label>
                      <input 
                        type="date" 
                        name="dateOfBirth" 
                        value={formData.dateOfBirth} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                      />
                      {errors.dateOfBirth && <p className="mt-1.5 text-xs text-red-400">{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Ethnicity (Optional)</label>
                      <input 
                        type="text" 
                        name="ethnicity" 
                        value={formData.ethnicity} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="Hispanic / Asian / White"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Country *</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="USA"
                      />
                      {errors.country && <p className="mt-1.5 text-xs text-red-400">{errors.country}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">State *</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="California"
                      />
                      {errors.state && <p className="mt-1.5 text-xs text-red-400">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">City *</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="Los Angeles"
                      />
                      {errors.city && <p className="mt-1.5 text-xs text-red-400">{errors.city}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BODY METRICS */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#02306d]/30 pb-3">
                    <Heart className="h-5 w-5 text-[#00b4d8]" />
                    <h2 className="text-lg font-bold text-white">Body Metrics</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Height (cm) *</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="heightCm" 
                        value={formData.heightCm} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="175.5"
                      />
                      {errors.heightCm && <p className="mt-1.5 text-xs text-red-400">{errors.heightCm}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Weight (kg) *</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="weightKg" 
                        value={formData.weightKg} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="72.3"
                      />
                      {errors.weightKg && <p className="mt-1.5 text-xs text-red-400">{errors.weightKg}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Target Weight (kg, Optional)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="targetWeightKg" 
                        value={formData.targetWeightKg} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="70.0"
                      />
                      {errors.targetWeightKg && <p className="mt-1.5 text-xs text-red-400">{errors.targetWeightKg}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Waist (cm, Optional)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="waistCm" 
                        value={formData.waistCm} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="82.0"
                      />
                      {errors.waistCm && <p className="mt-1.5 text-xs text-red-400">{errors.waistCm}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Body Fat Percentage (%, Optional)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="bodyFatPercentage" 
                        value={formData.bodyFatPercentage} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="15.4"
                      />
                      {errors.bodyFatPercentage && <p className="mt-1.5 text-xs text-red-400">{errors.bodyFatPercentage}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LIFESTYLE & GOALS */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#02306d]/30 pb-3">
                    <Dumbbell className="h-5 w-5 text-[#00b4d8]" />
                    <h2 className="text-lg font-bold text-white">Lifestyle & Goals</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Activity Level *</label>
                      <select 
                        name="activityLevel" 
                        value={formData.activityLevel} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition"
                      >
                        <option value="sedentary">Sedentary (Little/no exercise)</option>
                        <option value="light">Light (1-3 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                        <option value="very_active">Very Active (Heavy training)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Goal *</label>
                      <select 
                        name="goal" 
                        value={formData.goal} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition"
                      >
                        <option value="lose_weight">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain_muscle">Gain Muscle</option>
                        <option value="gain_weight">Gain Weight</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Target Calories (Optional)</label>
                      <input 
                        type="number" 
                        name="targetCalories" 
                        value={formData.targetCalories} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="2200"
                      />
                      {errors.targetCalories && <p className="mt-1.5 text-xs text-red-400">{errors.targetCalories}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Workout Days Per Week (Optional)</label>
                      <input 
                        type="number" 
                        name="workoutDaysPerWeek" 
                        value={formData.workoutDaysPerWeek} 
                        onChange={handleChange}
                        min="0"
                        max="7"
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="4"
                      />
                      {errors.workoutDaysPerWeek && <p className="mt-1.5 text-xs text-red-400">{errors.workoutDaysPerWeek}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Sleep Hours (Optional)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        name="sleepHours" 
                        value={formData.sleepHours} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="7.5"
                      />
                      {errors.sleepHours && <p className="mt-1.5 text-xs text-red-400">{errors.sleepHours}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Occupation (Optional)</label>
                      <input 
                        type="text" 
                        name="occupation" 
                        value={formData.occupation} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] placeholder-[#ade8f4]/30 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition" 
                        placeholder="Developer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DIET, ALLERGIES & HEALTH */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#02306d]/30 pb-3">
                    <Utensils className="h-5 w-5 text-[#00b4d8]" />
                    <h2 className="text-lg font-bold text-white">Diet, Allergies & Health</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Diet Type *</label>
                      <select 
                        name="dietType" 
                        value={formData.dietType} 
                        onChange={handleChange}
                        className="w-full bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2.5 text-[#e9f9fc] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/40 transition"
                      >
                        <option value="non_vegetarian">Non-Vegetarian</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="eggetarian">Eggetarian</option>
                      </select>
                    </div>

                    {/* Habits */}
                    <div className="flex flex-col justify-center gap-4 bg-[#010113] p-4 rounded-xl border border-[#02306d]/40">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="smoking" 
                          name="smoking" 
                          checked={formData.smoking} 
                          onChange={handleChange}
                          className="h-4 w-4 bg-[#010226] border-[#02306d]/65 text-[#00b4d8] focus:ring-0 rounded"
                        />
                        <label htmlFor="smoking" className="text-xs font-semibold text-[#ade8f4]/80 uppercase tracking-wide cursor-pointer">I Smoke Tobacco</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="alcohol" 
                          name="alcohol" 
                          checked={formData.alcohol} 
                          onChange={handleChange}
                          className="h-4 w-4 bg-[#010226] border-[#02306d]/65 text-[#00b4d8] focus:ring-0 rounded"
                        />
                        <label htmlFor="alcohol" className="text-xs font-semibold text-[#ade8f4]/80 uppercase tracking-wide cursor-pointer">I Consume Alcohol</label>
                      </div>
                    </div>
                  </div>

                  {/* Chip Input Lists */}
                  <div className="space-y-4">
                    {/* Allergies */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Allergies</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={allergyInput} 
                          onChange={e => setAllergyInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChip('allergies', allergyInput, setAllergyInput);
                            }
                          }}
                          className="flex-1 bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2 text-sm text-[#e9f9fc] placeholder-[#ade8f4]/35 focus:outline-none focus:border-[#00b4d8]"
                          placeholder="e.g. Peanuts (Press Enter)"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddChip('allergies', allergyInput, setAllergyInput)}
                          className="bg-[#023e8a] hover:bg-[#0077b6] text-white px-3 rounded-xl flex items-center justify-center transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.allergies.map((chip, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-red-950/40 border border-red-500/30 text-red-200 px-2.5 py-1 rounded-full">
                            {chip}
                            <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => handleRemoveChip('allergies', idx)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Disliked Foods */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Disliked Foods</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={dislikedInput} 
                          onChange={e => setDislikedInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChip('dislikedFoods', dislikedInput, setDislikedInput);
                            }
                          }}
                          className="flex-1 bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2 text-sm text-[#e9f9fc] placeholder-[#ade8f4]/35 focus:outline-none focus:border-[#00b4d8]"
                          placeholder="e.g. Broccoli (Press Enter)"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddChip('dislikedFoods', dislikedInput, setDislikedInput)}
                          className="bg-[#023e8a] hover:bg-[#0077b6] text-white px-3 rounded-xl flex items-center justify-center transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.dislikedFoods.map((chip, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-orange-950/40 border border-orange-500/30 text-orange-200 px-2.5 py-1 rounded-full">
                            {chip}
                            <X className="h-3 w-3 cursor-pointer hover:text-orange-400" onClick={() => handleRemoveChip('dislikedFoods', idx)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Cuisine */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Preferred Cuisine</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={cuisineInput} 
                          onChange={e => setCuisineInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChip('preferredCuisine', cuisineInput, setCuisineInput);
                            }
                          }}
                          className="flex-1 bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2 text-sm text-[#e9f9fc] placeholder-[#ade8f4]/35 focus:outline-none focus:border-[#00b4d8]"
                          placeholder="e.g. Italian (Press Enter)"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddChip('preferredCuisine', cuisineInput, setCuisineInput)}
                          className="bg-[#023e8a] hover:bg-[#0077b6] text-white px-3 rounded-xl flex items-center justify-center transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.preferredCuisine.map((chip, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-[#02044b] border border-[#00b4d8]/40 text-[#90e0ef] px-2.5 py-1 rounded-full">
                            {chip}
                            <X className="h-3 w-3 cursor-pointer hover:text-white" onClick={() => handleRemoveChip('preferredCuisine', idx)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Health Conditions */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Health Conditions</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={conditionInput} 
                          onChange={e => setConditionInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChip('conditions', conditionInput, setConditionInput);
                            }
                          }}
                          className="flex-1 bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2 text-sm text-[#e9f9fc] placeholder-[#ade8f4]/35 focus:outline-none focus:border-[#00b4d8]"
                          placeholder="e.g. Hypertension (Press Enter)"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddChip('conditions', conditionInput, setConditionInput)}
                          className="bg-[#023e8a] hover:bg-[#0077b6] text-white px-3 rounded-xl flex items-center justify-center transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.conditions.map((chip, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-[#001825] border border-[#0077b6]/35 text-[#ade8f4] px-2.5 py-1 rounded-full">
                            {chip}
                            <X className="h-3 w-3 cursor-pointer hover:text-white" onClick={() => handleRemoveChip('conditions', idx)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Medications */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ade8f4]/80 mb-2 uppercase tracking-wide">Medications</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={medicationInput} 
                          onChange={e => setMedicationInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChip('medications', medicationInput, setMedicationInput);
                            }
                          }}
                          className="flex-1 bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-2 text-sm text-[#e9f9fc] placeholder-[#ade8f4]/35 focus:outline-none focus:border-[#00b4d8]"
                          placeholder="e.g. Metformin (Press Enter)"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddChip('medications', medicationInput, setMedicationInput)}
                          className="bg-[#023e8a] hover:bg-[#0077b6] text-white px-3 rounded-xl flex items-center justify-center transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.medications.map((chip, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-[#0a3f4a] border border-[#65d4ea]/30 text-[#ade8f4] px-2.5 py-1 rounded-full">
                            {chip}
                            <X className="h-3 w-3 cursor-pointer hover:text-white" onClick={() => handleRemoveChip('medications', idx)} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center border-t border-[#02306d]/30 pt-6 mt-8">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 border border-[#02306d]/40 hover:border-[#00b4d8]/50 text-[#ade8f4]/80 hover:text-white bg-[#010113] rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-150 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 bg-[#023e8a] hover:bg-[#0077b6] text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-lg shadow-[#023e8a]/20"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] hover:from-[#00a2f9] hover:to-[#4ccfe6] text-[#010113] rounded-xl px-6 py-2.5 text-sm font-bold transition shadow-lg shadow-[#00b4d8]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Create Profile
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
