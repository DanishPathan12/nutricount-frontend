'use client';

import { useState, useRef, DragEvent, useEffect } from 'react';
import axios from 'axios';
import api from '@/lib/axios';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Flame,
  Scale,
  Sparkles,
  Heart,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface FoodItem {
  name: string;
  confidence: number;
  estimatedWeightGrams: number;
  calories: number;
}

interface MacronutrientInfo {
  grams: number;
  percentage: number;
}

interface Macronutrients {
  carbohydrates: MacronutrientInfo;
  protein: MacronutrientInfo;
  fat: MacronutrientInfo;
}

interface Micronutrient {
  name: string;
  amount: string;
  percentageDailyValue: number;
}

interface HealthinessInfo {
  score: number;
  isHealthy: boolean;
  rating: string;
  explanation: string;
  pros: string[];
  cons: string[];
}

interface NutritionData {
  foodDetected: FoodItem[];
  calories: {
    total: number;
    range: string;
  };
  macronutrients: Macronutrients;
  micronutrients: Micronutrient[];
  healthiness: HealthinessInfo;
  summary: string;
  recommendations: string[];
}

interface UploadResult {
  key: string;
  fileUrl: string;
}

const LOADING_STEPS = [
  'Uploading image to secure storage...',
  'Analyzing visual features of the food...',
  'Identifying individual items on the plate...',
  'Estimating portion weights & calorie count...',
  'Breaking down macronutrients and micronutrients...',
  'Formulating healthiness score & recommendations...',
];

export default function CalorieEstimatorPage() {
  // Upload and file states
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Loader messages
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);

  // Analysis result state
  const [nutritionResult, setNutritionResult] = useState<NutritionData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle loader messages while analyzing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000);
    } else {
      setLoadingStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setNutritionResult(null);

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, WEBP, GIF).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const triggerUploadAndAnalysis = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    let key = '';
    let fileUrl = '';

    try {
      // Step 1: Request pre-signed URL from backend
      const presignedRes = await api.post('/upload/presigned-url', {
        fileName: file.name,
        fileType: file.type,
      });

      const { uploadUrl, fileUrl: s3Url, key: s3Key } = presignedRes.data.data;
      key = s3Key;
      fileUrl = s3Url;

      // Step 2: Upload file to storage (AWS or mock endpoint)
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setIsUploading(false);
      setIsAnalyzing(true);

      // Step 3: Trigger Gemini analysis in the backend
      const analysisRes = await api.post('/nutrition/analyze', {
        imageKey: key,
        imageUrl: fileUrl,
      });

      setNutritionResult(analysisRes.data.data);
    } catch (err: any) {
      console.error('Error during nutrition analysis flow:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred during calorie estimation. Please try again.'
      );
      setIsUploading(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsAnalyzing(false);
    setError(null);
    setNutritionResult(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AI Calorie <span className="text-[#00b4d8]">Estimator</span>
        </h1>
        <p className="mt-2 text-sm text-[#ade8f4]/60">
          Upload an image of your meal plate or food product. Our advanced Gemini AI will analyze the picture to estimate calories, macros, micros, and health rating.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Upload & Image Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#010226]/60 border border-[#02306d]/40 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#00b4d8]" />
              Food Photo
            </h2>

            {/* Drag & Drop Area */}
            {!file && (
              <div
                onDragOver={(e) => handleDrag(e, true)}
                onDragLeave={(e) => handleDrag(e, false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition duration-200 text-center min-h-[220px] ${dragActive
                    ? 'border-[#00b4d8] bg-[#00b4d8]/5 scale-[0.99]'
                    : 'border-[#02306d]/60 hover:border-[#00b4d8]/60 hover:bg-[#02306d]/10'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="h-12 w-12 rounded-full bg-[#02306d]/40 flex items-center justify-center mb-4">
                  <UploadCloud className="h-6 w-6 text-[#00b4d8]" />
                </div>
                <p className="text-sm font-semibold text-white">Drag & drop meal photo here</p>
                <p className="text-xs text-[#ade8f4]/40 mt-1">or click to browse from files</p>
                <p className="text-[10px] text-[#ade8f4]/30 mt-3">Supports JPG, PNG, WEBP, GIF up to 10MB</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-200">Analysis Failed</p>
                  <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Image Preview and Analysis Button */}
            {previewUrl && (
              <div className="flex flex-col gap-4">
                <div className="border border-[#02306d]/40 rounded-xl bg-[#010113] overflow-hidden flex items-center justify-center relative min-h-[220px]">
                  <img
                    src={previewUrl}
                    alt="Meal Preview"
                    className="max-h-72 max-w-full object-contain rounded-lg shadow-md"
                  />
                </div>

                {!isUploading && !isAnalyzing && !nutritionResult && (
                  <div className="flex gap-3">
                    <button
                      onClick={resetState}
                      className="flex-1 py-2 text-xs font-semibold text-[#ade8f4]/60 hover:text-white border border-[#02306d]/40 hover:border-[#00b4d8]/40 rounded-lg transition"
                    >
                      Clear Image
                    </button>
                    <button
                      onClick={triggerUploadAndAnalysis}
                      className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#00c5eb] hover:to-[#0088cf] rounded-lg transition shadow-md shadow-[#00b4d8]/10 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Estimate Calories
                    </button>
                  </div>
                )}

                {/* Uploading Progress */}
                {isUploading && (
                  <div className="border border-[#02306d]/60 rounded-xl p-4 bg-[#010226]/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#ade8f4] flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00b4d8]" />
                        Uploading photo...
                      </span>
                      <span className="text-xs font-bold text-[#00b4d8]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#02306d]/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#00b4d8] to-[#03045e] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Analyzing Loader */}
                {isAnalyzing && (
                  <div className="border border-[#02306d]/60 rounded-xl p-5 bg-[#010226]/40 text-center flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00b4d8]" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Gemini is Estimating...</p>
                      <p className="text-xs text-[#ade8f4]/60 mt-1.5 animate-pulse min-h-[16px]">
                        {LOADING_STEPS[loadingStepIndex]}
                      </p>
                    </div>
                  </div>
                )}

                {/* Analyze Another Image Button when results exist */}
                {nutritionResult && (
                  <button
                    onClick={resetState}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#02306d]/40 hover:bg-[#02306d] border border-[#00b4d8]/30 hover:border-[#00b4d8]/60 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Scan Another Dish
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Results Dashboard */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!nutritionResult && !isAnalyzing && !isUploading && (
            <div className="bg-[#010226]/40 border border-[#02306d]/20 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center justify-center text-center min-h-[350px]">
              <div className="h-16 w-16 rounded-2xl bg-[#02306d]/20 flex items-center justify-center mb-4 text-[#00b4d8]/60">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Meal Analyzed</h3>
              <p className="text-sm text-[#ade8f4]/60 mt-2 max-w-sm">
                Select an image on the left and click "Estimate Calories" to initiate AI nutritional and caloric breakdown.
              </p>
            </div>
          )}

          {/* Loader skeleton while analyzing */}
          {isAnalyzing && (
            <div className="bg-[#010226]/40 border border-[#02306d]/20 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6 min-h-[350px] animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-[#02306d]/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-[#02306d]/30 rounded" />
                  <div className="h-3.5 w-48 bg-[#02306d]/20 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-[#02306d]/20 rounded-xl" />
                <div className="h-24 bg-[#02306d]/20 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#02306d]/20 rounded" />
                <div className="h-3 w-5/6 bg-[#02306d]/20 rounded" />
                <div className="h-3 w-4/6 bg-[#02306d]/20 rounded" />
              </div>
            </div>
          )}

          {/* Analysis Dashboard Results */}
          {nutritionResult && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Health Score & Summary Card */}
              <div className="bg-gradient-to-br from-[#010226] to-[#02306d]/30 border border-[#02306d]/40 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-32 h-32 bg-[#00b4d8]/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Radial Score Gauge */}
                    <div className="relative flex items-center justify-center h-16 w-16 shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          className="stroke-[#02306d]/40"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          className={`transition-all duration-1000 ${nutritionResult.healthiness.isHealthy
                              ? 'stroke-emerald-400'
                              : nutritionResult.healthiness.score >= 5
                                ? 'stroke-yellow-400'
                                : 'stroke-rose-500'
                            }`}
                          strokeWidth="5"
                          strokeDasharray={176}
                          strokeDashoffset={176 - (176 * nutritionResult.healthiness.score) / 10}
                          fill="transparent"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-white">
                        {nutritionResult.healthiness.score}
                      </span>
                    </div>

                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mb-1 ${nutritionResult.healthiness.isHealthy
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                        {nutritionResult.healthiness.rating}
                      </span>
                      <h3 className="text-lg font-bold text-white">Overall Health Grade</h3>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] uppercase text-[#ade8f4]/40 font-bold tracking-widest">Portion Status</p>
                    <p className="text-sm font-semibold text-white">Estimated Weight: ~{nutritionResult.foodDetected.reduce((sum, item) => sum + item.estimatedWeightGrams, 0)}g</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#02306d]/20 pt-4">
                  <p className="text-xs text-[#ade8f4]/80 leading-relaxed font-semibold">
                    {nutritionResult.healthiness.explanation}
                  </p>
                </div>
              </div>

              {/* Calories & Macros Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Total Calories Card */}
                <div className="md:col-span-5 bg-[#010226]/60 border border-[#02306d]/40 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute left-0 bottom-0 translate-y-6 -translate-x-6 h-20 w-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

                  <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2 text-rose-400">
                    <Flame className="h-5 w-5 animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase text-rose-300/60 font-bold tracking-widest">Total Energy</span>
                  <span className="text-3xl font-black text-white mt-1">
                    {nutritionResult.calories.total} <span className="text-sm font-medium text-rose-300">kcal</span>
                  </span>
                  <span className="text-[10px] text-[#ade8f4]/40 mt-1 font-mono">{nutritionResult.calories.range}</span>
                </div>

                {/* Macros Breakdown Card */}
                <div className="md:col-span-7 bg-[#010226]/60 border border-[#02306d]/40 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-[#00b4d8]" />
                    Macronutrients
                  </h3>

                  <div className="space-y-3">
                    {/* Carb progress bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-cyan-200">Carbohydrates</span>
                        <span className="text-cyan-300 font-bold font-mono">
                          {nutritionResult.macronutrients.carbohydrates.grams}g ({nutritionResult.macronutrients.carbohydrates.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#02306d]/30 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${nutritionResult.macronutrients.carbohydrates.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Protein progress bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-emerald-200">Protein</span>
                        <span className="text-emerald-300 font-bold font-mono">
                          {nutritionResult.macronutrients.protein.grams}g ({nutritionResult.macronutrients.protein.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#02306d]/30 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${nutritionResult.macronutrients.protein.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Fat progress bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-amber-200">Fat</span>
                        <span className="text-amber-300 font-bold font-mono">
                          {nutritionResult.macronutrients.fat.grams}g ({nutritionResult.macronutrients.fat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#02306d]/30 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${nutritionResult.macronutrients.fat.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Foods */}
              <div className="bg-[#010226]/60 border border-[#02306d]/40 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#00b4d8]" />
                  Detected Food Items
                </h3>
                <div className="overflow-hidden border border-[#02306d]/40 rounded-xl">
                  <table className="min-w-full divide-y divide-[#02306d]/40 text-xs">
                    <thead className="bg-[#010113]/80">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#ade8f4]/60 uppercase">Item</th>
                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#ade8f4]/60 uppercase">Confidence</th>
                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#ade8f4]/60 uppercase">Est. Weight</th>
                        <th scope="col" className="px-4 py-3 text-right font-bold text-[#ade8f4]/60 uppercase">Calories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#02306d]/20 bg-[#010226]/20">
                      {nutritionResult.foodDetected.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#02306d]/10 transition duration-150">
                          <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-[#00b4d8]">
                            {Math.round(item.confidence * 100)}%
                          </td>
                          <td className="px-4 py-3 text-center text-[#ade8f4]/80 font-semibold">
                            {item.estimatedWeightGrams}g
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-white font-mono">{item.calories} kcal</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Micronutrients */}
              <div className="bg-[#010226]/60 border border-[#02306d]/40 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-[#00b4d8]" />
                  Key Micronutrients & Daily Value
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nutritionResult.micronutrients.map((micro, idx) => (
                    <div key={idx} className="bg-[#010113]/55 border border-[#02306d]/30 rounded-xl p-3.5">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-[#ade8f4]">{micro.name}</span>
                        <span className="font-bold text-white font-mono">{micro.amount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#02306d]/30 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${micro.name.toLowerCase().includes('saturated') || micro.name.toLowerCase().includes('sodium') || micro.name.toLowerCase().includes('sugar')
                                ? micro.percentageDailyValue > 30
                                  ? 'bg-rose-500'
                                  : 'bg-[#00b4d8]'
                                : 'bg-emerald-400'
                              }`}
                            style={{ width: `${Math.min(micro.percentageDailyValue, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#ade8f4]/60 font-mono shrink-0">
                          {micro.percentageDailyValue}% DV
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Summary, Pros, Cons */}
              <div className="bg-[#010226]/60 border border-[#02306d]/40 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-[#00b4d8]" />
                    Nutritional Narrative
                  </h3>
                  <p className="text-xs text-[#ade8f4]/70 leading-relaxed font-semibold">
                    {nutritionResult.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#02306d]/20 pt-4">
                  {/* Pros */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Nutritional Benefits
                    </h4>
                    <ul className="text-xs text-[#ade8f4]/70 space-y-1.5 list-disc pl-4 font-semibold">
                      {nutritionResult.healthiness.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Areas of Caution
                    </h4>
                    <ul className="text-xs text-[#ade8f4]/70 space-y-1.5 list-disc pl-4 font-semibold">
                      {nutritionResult.healthiness.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border-t border-[#02306d]/20 pt-4">
                  <h3 className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4" />
                    Dietary Adjustments & Tips
                  </h3>
                  <ul className="text-xs text-[#ade8f4]/70 space-y-1.5 list-none pl-0 font-semibold">
                    {nutritionResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#00b4d8] shrink-0 font-bold">💡</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
