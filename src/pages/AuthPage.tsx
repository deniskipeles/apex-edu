import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { GraduationCap, Lock, Mail, User, BookOpen, DollarSign, TextQuote, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const { login, register, error, isAuthenticated, isLoading } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  
  // Tutor specific onboarding fields
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('35');
  const [expertise, setExpertise] = useState('');

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegistering(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      const expertiseList = expertise
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await register(email, password, name, role, {
        bio,
        hourlyRate: Number(hourlyRate),
        expertise: expertiseList
      });
    } else {
      await login(email, password);
    }
  };

  // Demo account quick login helper (extremely useful for reviews!)
  const handleQuickLogin = async (type: 'student' | 'tutor') => {
    if (type === 'student') {
      setEmail('julian@edu.com');
      setPassword('password123');
      await login('julian@edu.com', 'password123');
    } else {
      setEmail('tutor.aris@edu.com');
      setPassword('password123');
      await login('tutor.aris@edu.com', 'password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/20" id="auth_page_container">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Visual onboarding side pane */}
        <div className="hidden md:flex md:w-5/12 bg-slate-950 p-6 flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-950/40 via-transparent to-indigo-950/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="bg-sky-600 text-white p-1.5 rounded-lg shadow">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold heading-font text-sm">EduSolve</span>
            </div>
            <h3 className="text-lg font-bold mt-8 heading-font leading-tight">University homework help made secure.</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Unlock academic success. Discuss homework guidelines in direct chats, upload project drafts, and process escrow-protected contracts safely.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 relative z-10 font-medium">
            Protected by FinCEN ESCROW standards.
          </div>
        </div>

        {/* Dynamic form wrapper */}
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 heading-font tracking-tight">
              {isRegistering ? 'Create Academic Account' : 'Welcome back!'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              {isRegistering
                ? 'Onboard as student to request support or as tutor to bid.'
                : 'Access your university tutoring assignments workspace.'}
            </p>
          </div>

          {/* Quick seeded logins buttons (Demo helpers) */}
          {!isRegistering && (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-3 rounded-2xl space-y-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block text-center">
                Demo Accounts Quick-Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  Student Account
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tutor')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  Tutor Account
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-400 rounded-xl leading-normal text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all"
                    placeholder="Full Academic Name"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Role switch */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5 text-center">
                    I want to register as a:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        role === 'student'
                          ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-800 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      University Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('tutor')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        role === 'tutor'
                          ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-800 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      Expert Tutor
                    </button>
                  </div>
                </div>

                {/* Tutor-specific inputs */}
                {role === 'tutor' && (
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-3.5 mt-2 animate-fade-in">
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider block">Tutor Credentials Settings</span>
                    
                    {/* Hourly rate */}
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        required
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 pl-10 pr-4 py-2 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 transition-all font-semibold"
                        placeholder="Hourly tutoring fee (USD)"
                      />
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Expertise */}
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 pl-10 pr-4 py-2 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 transition-all"
                        placeholder="Expertise codes (e.g. CS 101, MATH 201)"
                      />
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Bio */}
                    <div className="relative">
                      <textarea
                        required
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 pl-10 pr-4 py-2 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 transition-all resize-none"
                        placeholder="Write a brief professional intro..."
                      />
                      <TextQuote className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all"
                placeholder="Student / Tutor email address"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all"
                placeholder="Secure account password"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-5"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  Create Free Account
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          {/* Toggle login vs register */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold cursor-pointer"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account yet? Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
