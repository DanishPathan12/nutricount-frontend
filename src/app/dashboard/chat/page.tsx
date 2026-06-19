'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/axios';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ArrowLeft,
  Info,
  ChevronRight,
  AlertCircle,
  Dumbbell,
  Heart,
  Scale,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/markdown-renderer';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${profile?.firstName || user?.name || 'there'}! 👋 I am **NutriBot**, your personalized AI fitness and nutrition coach. 

${profile ? `I've analyzed your profile goals (*${profile.goal.replace('_', ' ')}*) and metrics. Ask me any questions about meal plans, nutrition, workouts, or recovery!` : "I noticed you haven't completed your profile yet! For personalized guidance tailored to your height, weight, activity levels, and goals, please complete your profile. In the meantime, I can answer any general fitness or nutrition questions you have!"}`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/fitness-chat', { message: text });
      
      const botResponseText = response.data.data.response;
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Failed to get chat response', err);
      setError(err.response?.data?.message || 'Failed to connect to the assistant. Please try again.');
    } finally {
      setIsLoading(false);
      // Re-focus the textarea
      textareaRef.current?.focus();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    handleSendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const quickPrompts = [
    "What should I eat post-workout?",
    "Give me a simple 3-day workout split.",
    "Healthy high-protein snack ideas",
    "Should I eat less carbs on rest days?"
  ];

  return (
    <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Back button and page title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#ade8f4]/60 hover:text-[#00b4d8] transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-[#00b4d8] animate-pulse" />
            Fitness Chat
          </h1>
          <p className="text-xs text-[#ade8f4]/60 mt-1 max-w-lg">
            Chat with our AI trainer and nutritionist to get customized advice based on your metrics and goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-14rem)] min-h-[500px]">
        
        {/* Chat Area (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col bg-[#010226] border border-[#02306d]/40 rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Top Panel - Mini status */}
          <div className="bg-[#010113]/80 border-b border-[#02306d]/40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#03045e] p-2 flex items-center justify-center border border-[#00b4d8]/20 shadow-md shadow-[#00b4d8]/10">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  NutriBot
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                </h3>
                <p className="text-[10px] text-[#ade8f4]/50">Powered by Gemini AI</p>
              </div>
            </div>
            
            {/* Quick check on customization status */}
            <div className="hidden sm:block">
              {profile ? (
                <div className="flex items-center gap-1.5 bg-[#0077b6]/10 border border-[#00b4d8]/25 px-2.5 py-1 rounded-lg text-[10px] text-[#ade8f4]/80">
                  <Sparkles className="h-3 w-3 text-[#00b4d8]" />
                  Personalized Context Active
                </div>
              ) : (
                <Link
                  href="/profile/setup"
                  className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] text-amber-300 hover:bg-amber-500/20 transition"
                >
                  <AlertCircle className="h-3 w-3" />
                  Profile setup recommended
                </Link>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="hidden sm:flex h-8 w-8 rounded-lg bg-[#02306d]/40 border border-[#00b4d8]/20 p-1.5 items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-[#00b4d8]" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#023e8a] to-[#0077b6] text-white rounded-tr-none border border-[#00b4d8]/20'
                    : 'bg-[#010113]/70 border border-[#02306d]/30 text-[#e9f9fc] rounded-tl-none'
                }`}>
                  <div className="text-xs font-semibold mb-1 opacity-50 flex items-center justify-between">
                    <span>{msg.sender === 'user' ? 'You' : 'NutriBot'}</span>
                    <span className="text-[9px]">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed break-words whitespace-pre-line">
                    {msg.sender === 'user' ? (
                      msg.text
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="hidden sm:flex h-8 w-8 rounded-lg bg-[#0077b6]/20 border border-[#00b4d8]/20 p-1.5 items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-[#ade8f4]" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="hidden sm:flex h-8 w-8 rounded-lg bg-[#02306d]/40 border border-[#00b4d8]/20 p-1.5 items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-[#00b4d8]" />
                </div>
                <div className="bg-[#010113]/70 border border-[#02306d]/30 rounded-2xl rounded-tl-none p-4 shadow-md w-24">
                  <div className="flex justify-center items-center gap-1.5 h-4">
                    <span className="h-1.5 w-1.5 bg-[#00b4d8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-[#00b4d8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-[#00b4d8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - shown only when the conversation is short/empty or user hasn't typed */}
          {messages.length === 1 && !isLoading && (
            <div className="px-6 py-2 border-t border-[#02306d]/20 bg-[#010113]/20">
              <p className="text-[10px] font-bold text-[#ade8f4]/40 uppercase tracking-wider mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs bg-[#02306d]/20 hover:bg-[#02306d]/55 border border-[#00b4d8]/15 hover:border-[#00b4d8]/40 text-[#ade8f4]/80 hover:text-white px-3 py-1.5 rounded-xl transition duration-150 text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-[#02306d]/40 p-4 bg-[#010113]/40">
            <form onSubmit={handleFormSubmit} className="flex gap-2 relative items-end">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? 'NutriBot is typing...' : 'Ask NutriBot about meals, workout schedules...'}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-[#010113] border border-[#02306d]/40 rounded-xl px-4 py-3 pr-12 text-xs focus:outline-none focus:border-[#00b4d8] text-[#e9f9fc] placeholder-[#ade8f4]/30 resize-none max-h-24 min-h-[44px] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="absolute right-2 bottom-2 p-2 bg-[#0077b6] hover:bg-[#00b4d8] disabled:bg-[#02306d]/45 disabled:text-[#ade8f4]/30 text-white rounded-lg transition shadow-lg disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="flex justify-between items-center text-[9px] text-[#ade8f4]/40 mt-2 px-1">
              <span>Press Enter to send, Shift + Enter for new line</span>
              <span>{inputText.length} characters</span>
            </div>
          </div>

        </div>

        {/* Sidebar context details (lg:col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Personalization metrics summary */}
          <div className="bg-[#010226] border border-[#02306d]/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00b4d8]/5 blur-2xl pointer-events-none rounded-full" />
            
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wide">
              <Info className="h-4 w-4 text-[#00b4d8]" />
              AI Context Profile
            </h3>

            {profile ? (
              <div className="space-y-4">
                <p className="text-[11px] text-[#ade8f4]/60 leading-relaxed">
                  NutriBot uses the profile metrics below to personalize all tips, meal suggestions, and training splits.
                </p>

                <div className="space-y-3 pt-3 border-t border-[#02306d]/20 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#00b4d8]" />Age & Gender</span>
                    <span className="font-semibold text-white capitalize">{profile.age} yrs, {profile.gender}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Scale className="h-3.5 w-3.5 text-[#00b4d8]" />Weight</span>
                    <span className="font-semibold text-white">{profile.weightKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5 text-[#00b4d8]" />Goal</span>
                    <span className="font-semibold text-white capitalize">{profile.goal.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#ade8f4]/50 flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#00b4d8]" />Diet Type</span>
                    <span className="font-semibold text-[#ade8f4] capitalize">{profile.dietType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#02306d]/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#ade8f4]/40 mb-2">Food Preferences</p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#ade8f4]/50">Allergies:</span>
                      <span className="text-white truncate max-w-[120px] font-medium" title={profile.allergies.join(', ') || 'None'}>
                        {profile.allergies.join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#ade8f4]/50">Cuisines:</span>
                      <span className="text-white truncate max-w-[120px] font-medium" title={profile.preferredCuisine.join(', ') || 'None'}>
                        {profile.preferredCuisine.join(', ') || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-4 w-full inline-flex items-center justify-between bg-[#023e8a]/20 hover:bg-[#023e8a]/45 border border-[#00b4d8]/20 hover:border-[#00b4d8]/40 text-[#ade8f4] text-xs font-semibold px-3 py-2 rounded-xl transition"
                >
                  <span>Update Profile Info</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2 items-start text-xs text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <p className="leading-normal">
                    You have not set up your profile metrics yet. NutriBot will fallback to general fitness guidance.
                  </p>
                </div>
                <Link
                  href="/profile/setup"
                  className="w-full inline-flex items-center justify-between bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition"
                >
                  <span>Complete Setup Now</span>
                  <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
                </Link>
              </div>
            )}
          </div>

          {/* AI Advisor Disclaimer */}
          <div className="bg-[#010226]/40 border border-[#02306d]/20 rounded-2xl p-5 text-[10px] text-[#ade8f4]/45 space-y-2 leading-relaxed">
            <h4 className="font-bold text-[#ade8f4]/65 uppercase">Disclaimer</h4>
            <p>
              NutriBot provides informational guidelines for nutrition and workout tracking. It is not a replacement for professional medical advice, diagnosis, or customized treatment plans.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
