
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Calendar,
  Lightbulb,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  KeyRound,
  Check,
} from 'lucide-react';
import Button from '../components/Button';
import {
  HandUnderline,
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
} from '../components/public/Doodles';
import { auth } from '../utils/auth';
import { useToast } from '../components/Toast';
import { useScrollLock } from '../hooks/useScrollLock';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  useScrollLock(showForgotModal);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);

  // Timer for OTP resend cooldown in modal
  useEffect(() => {
    let timer;
    if (forgotResendCooldown > 0) {
      timer = setInterval(() => {
        setForgotResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotResendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform login
    try {
      const success = await auth.login(email, password);

      if (success) {
        // Redirect based on role
        const user = auth.getCurrentUser();
        
        if (user && user.role) {
          navigate(`/dashboard/${user.role}`);
        } else {
          // Fallback if something went wrong
          console.error("Login successful but no role found", user);
          toast.error("Login successful but could not determine user role.");
        }
      }
    } catch (error) {
      toast.error(error?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="roboto-bold min-h-0 lg:min-h-screen bg-[#F8FAFF] text-[#172554] relative overflow-hidden pt-[72px] md:pt-24 pb-7 sm:pb-8 lg:py-28 flex items-start lg:items-center">
      {/* Soft ambient background shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F3EEFF]/80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-[#F3EEFF]/70 blur-3xl"
      />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[18px] sm:gap-8 lg:gap-10 xl:gap-16 items-center">

          {/* ======================================================== */}
          {/* LEFT SIDE: VIBE Community Hero Section                   */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Top Headline Block */}
            <div className="relative max-w-xl">
              {/* Top-left yellow spark */}
              <div className="hidden sm:block absolute -top-6 -left-7 pointer-events-none">
                <SparkDoodle color="#FBBF24" size={34} className="-rotate-12" />
              </div>

              {/* Right floating pink loop doodle */}
              <div className="hidden sm:block absolute top-10 -right-8 pointer-events-none">
                <LoopDoodle color="#EC4899" size={34} />
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-[54px] font-black text-[#172554] leading-tight sm:leading-[1.12] tracking-tight">
                Welcome back to{" "}
                <span className="relative inline-block text-[#6D3DF5] mt-0.5 sm:mt-1">
                  VIBE
                  <HandUnderline
                    color="#FBBF24"
                    className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full"
                  />
                </span>
              </h2>

              <p className="mt-2.5 sm:mt-6 text-xs sm:text-base lg:text-lg text-[#64748B] leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
                Log in to continue your journey — connect, learn, share, and grow
                with an inspiring community of students and faculty.
              </p>
            </div>

            {/* Center Student Illustration + Floating Academic Badges */}
            <div className="hidden lg:block relative mt-10 sm:mt-12 w-full max-w-[520px] mx-auto lg:mx-0">
              {/* Soft Organic Pastel Blobs Behind Student */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-6 bottom-4 rounded-[48px] bg-gradient-to-tr from-[#F3EEFF] via-[#FCE7F3]/60 to-[#FEF9C3]/60 -z-10 transform -rotate-2"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-8 bottom-4 w-44 h-44 rounded-full bg-[#FEF3C7]/70 -z-10"
              />

              {/* Decorative Dashed Arc Top-Right */}
              <svg
                aria-hidden="true"
                className="hidden sm:block pointer-events-none absolute -top-6 right-4 w-28 h-20 text-[#94A3B8]"
                viewBox="0 0 120 80"
                fill="none"
              >
                <path
                  d="M10 65 C 35 15, 85 15, 110 35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Decorative Doodles around Illustration */}
              <div className="hidden sm:block pointer-events-none absolute -top-3 left-8">
                <StarDoodle color="#FBBF24" size={22} />
              </div>
              <div className="hidden sm:block pointer-events-none absolute top-16 left-2">
                <SpiralDoodle color="#6D3DF5" size={26} />
              </div>
              <div className="hidden sm:block pointer-events-none absolute bottom-16 right-2">
                <StarDoodle color="#6D3DF5" size={20} />
              </div>
              <div className="hidden sm:block pointer-events-none absolute -bottom-2 left-8">
                <LoopDoodle color="#EC4899" size={28} />
              </div>

              {/* Floating Pill 1: Communities (Top-Left) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="hidden sm:flex absolute -top-4 left-16 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FEF9C3] border border-[#FEF08A] shadow-sm -rotate-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#172554] flex items-center justify-center shadow-2xs">
                  <Users size={17} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#172554]">
                  Communities
                </span>
              </motion.div>

              {/* Floating Lightbulb Icon Badge (Top-Right of Student) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden sm:flex absolute -top-2 right-24 z-20 w-12 h-12 rounded-full bg-[#FEF3C7] border-2 border-white shadow-sm items-center justify-center"
              >
                <Lightbulb size={22} className="text-[#D97706] fill-[#FBBF24]" />
              </motion.div>

              {/* Floating Pill 2: Mentorship (Upper-Right) */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="hidden sm:flex absolute top-14 -right-2 sm:right-0 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] shadow-sm rotate-2"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#0284C7] flex items-center justify-center shadow-2xs">
                  <GraduationCap size={17} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#172554]">
                  Mentorship
                </span>
              </motion.div>

              {/* Floating Pill 3: Resources (Lower-Right) */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="hidden sm:flex absolute top-36 -right-2 sm:right-2 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] shadow-sm -rotate-1"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#DB2777] flex items-center justify-center shadow-2xs">
                  <BookOpen size={17} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#172554]">
                  Resources
                </span>
              </motion.div>

              {/* Floating Pill 4: Events (Bottom-Left) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="hidden sm:flex absolute bottom-8 -left-2 sm:left-0 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] shadow-sm -rotate-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#16A34A] flex items-center justify-center shadow-2xs">
                  <Calendar size={17} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#172554]">
                  Events
                </span>
              </motion.div>

              {/* Main Student with Laptop Image Container */}
              <div className="relative z-10 mx-auto w-64 sm:w-80 md:w-88 pt-6">
                <div className="rounded-[36px] overflow-hidden border-4 border-white shadow-lg bg-white aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&auto=format&fit=crop&q=80"
                    alt="Student learning and connecting on laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mobile-Friendly Compact Pill Row (Visible on extra-small screens) */}
              <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF9C3] border border-[#FEF08A] text-xs font-bold text-[#172554]">
                  <Users size={14} /> Communities
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-xs font-bold text-[#172554]">
                  <GraduationCap size={14} className="text-[#0284C7]" /> Mentorship
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] text-xs font-bold text-[#172554]">
                  <BookOpen size={14} className="text-[#DB2777]" /> Resources
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-xs font-bold text-[#172554]">
                  <Calendar size={14} className="text-[#16A34A]" /> Events
                </span>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="hidden lg:block mt-8 sm:mt-10 text-center w-full max-w-[520px] mx-auto lg:mx-0">
              <p className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
                Ideas. People. Opportunities.
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#6D3DF5] tracking-tight mt-0.5 relative inline-block">
                All in one place.
                <HandUnderline
                  color="#FBBF24"
                  className="absolute -bottom-2 left-0 w-full"
                />
              </p>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* RIGHT SIDE: Existing Login Form (Preserved Structure)    */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full">
            {/* Decorative Corner Loop Doodle */}
            <div
              aria-hidden="true"
              className="hidden sm:block pointer-events-none absolute -top-7 -right-5 z-20"
            >
              <LoopDoodle color="#6D3DF5" size={38} />
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgba(23,37,84,0.04)] max-w-md w-full mx-auto relative z-10">

              <div className="mb-5 sm:mb-8">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#172554] tracking-tight">
                    Login to <span className="text-[#6D3DF5]">VIBE</span>
                  </h1>
                  <SparkDoodle color="#FBBF24" size={24} className="-mt-2 sm:-mt-3" />
                </div>
                <p className="text-[#64748B] text-xs sm:text-base mt-1 sm:mt-1.5">
                  Secure access to your professional dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">

                {/* Form Fields */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key="login-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="space-y-0.5 sm:space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-[#6D3DF5]">Welcome back</h3>
                      <p className="text-xs sm:text-sm text-[#64748B]">Log in with your registered email to access your dashboard.</p>
                    </div>

                    <div className="space-y-3.5 sm:space-y-4">
                      <div className="relative group">
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#172554] mb-1.5 sm:mb-2 ml-1 group-focus-within:text-[#6D3DF5] transition-colors">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#6D3DF5] transition-all" size={18} />
                          <input
                            type="email"
                            name="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#F8FAFF] border border-[#E2E8F0] rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-[#172554] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10 transition-all font-medium"
                            placeholder="e.g. name@college.edu"
                          />
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="flex justify-between items-center mb-1.5 sm:mb-2 ml-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-[#172554] group-focus-within:text-[#6D3DF5] transition-colors">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            className="text-xs font-bold text-[#6D3DF5] hover:text-[#5B2ED0] transition-colors cursor-pointer"
                          >
                            Forgot?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#6D3DF5] transition-all" size={18} />
                          <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#F8FAFF] border border-[#E2E8F0] rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-[#172554] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10 transition-all font-medium"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-1 sm:pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    className="h-11 sm:h-12 lg:h-13 text-sm sm:text-base !rounded-full !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !shadow-md !shadow-[#6D3DF5]/20 focus:!ring-[#6D3DF5]"
                  >
                    Sign In to Dashboard <ArrowRight className="ml-2" size={18} />
                  </Button>
                </div>

                <div className="text-center pt-1">
                  <p className="text-[#64748B] text-xs sm:text-sm">
                    New to the platform?{' '}
                    <Link
                      to="/signup"
                      className="text-[#6D3DF5] hover:text-[#5B2ED0] font-bold hover:underline underline-offset-4"
                    >
                      Create your account
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/40 backdrop-blur-sm touch-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              className="bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden overscroll-contain"
            >
              <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFF]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#6D3DF5]/10 text-[#6D3DF5] flex items-center justify-center font-bold text-sm">
                    {forgotStep}/3
                  </div>
                  <h3 className="text-lg font-bold text-[#172554]">
                    {forgotStep === 1 && 'Reset Password'}
                    {forgotStep === 2 && 'Verify Code'}
                    {forgotStep === 3 && 'New Password'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep(1);
                  }} 
                  className="text-[#64748B] hover:text-[#172554] p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-4 overscroll-contain">
                {/* Step 1: Email Address */}
                {forgotStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-[#64748B] text-sm">
                      Enter your account email address and we'll send a 6-digit verification code to reset your password.
                    </p>
                    <InputField
                      label="Email Address"
                      icon={<Mail size={18} />}
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={setForgotEmail}
                    />
                    <Button 
                      fullWidth
                      disabled={forgotLoading || !forgotEmail.trim()}
                      className="!bg-[#6D3DF5] hover:!bg-[#5B2ED0] focus:!ring-[#6D3DF5] !py-3 !rounded-xl !font-bold"
                      onClick={async () => {
                        const clean = forgotEmail.trim();
                        if (!clean) { toast.error("Please enter your email"); return; }
                        setForgotLoading(true);
                        try {
                          await auth.forgotPassword(clean);
                          setForgotResendCooldown(60);
                          setForgotStep(2);
                          toast.success("Verification code sent to your email!");
                        } catch (err) {
                          toast.error(err.message || "Failed to send reset code");
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      {forgotLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 animate-spin" size={18} /> Sending Code...
                        </span>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                    <div className="text-center pt-1">
                      <Link
                        to="/forgot-password"
                        onClick={() => setShowForgotModal(false)}
                        className="text-xs text-[#6D3DF5] hover:underline font-semibold"
                      >
                        Prefer full screen? Open dedicated page
                      </Link>
                    </div>
                  </div>
                )}

                {/* Step 2: Verify 6-digit OTP */}
                {forgotStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-[#64748B] text-sm">
                      Enter the 6-digit verification code sent to <b className="text-[#172554]">{forgotEmail}</b>.
                    </p>
                    <div className="relative group">
                      <label className="vibe-auth-label group-focus-within:text-[#6D3DF5]">Verification Code</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#6D3DF5] transition-colors">
                          <ShieldCheck size={18} />
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          value={forgotOtp}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setForgotOtp(val);
                          }}
                          className="vibe-auth-input font-mono font-bold tracking-[0.3em] text-center"
                          placeholder="123456"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotOtp('');
                        }}
                        className="text-slate-500 hover:text-slate-800 font-medium"
                      >
                        Change email
                      </button>

                      {forgotResendCooldown > 0 ? (
                        <span className="text-slate-400">
                          Resend in <b className="text-[#6D3DF5]">{forgotResendCooldown}s</b>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={forgotLoading}
                          onClick={async () => {
                            setForgotLoading(true);
                            try {
                              await auth.forgotPassword(forgotEmail.trim());
                              setForgotResendCooldown(60);
                              toast.success("New code sent to your email!");
                            } catch (err) {
                              toast.error(err.message || "Failed to resend code");
                            } finally {
                              setForgotLoading(false);
                            }
                          }}
                          className="text-[#6D3DF5] font-bold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={12} className={forgotLoading ? 'animate-spin' : ''} />
                          Resend Code
                        </button>
                      )}
                    </div>

                    <Button 
                      fullWidth
                      disabled={forgotLoading || forgotOtp.trim().length < 6}
                      className="!bg-[#6D3DF5] hover:!bg-[#5B2ED0] focus:!ring-[#6D3DF5] !py-3 !rounded-xl !font-bold"
                      onClick={async () => {
                        const cleanOtp = forgotOtp.trim();
                        if (cleanOtp.length < 6) { toast.error("Enter the 6-digit code"); return; }
                        setForgotLoading(true);
                        try {
                          await auth.verifyResetOtp(forgotEmail.trim(), cleanOtp);
                          setForgotStep(3);
                          toast.success("Code verified! Set your new password.");
                        } catch (err) {
                          toast.error(err.message || "Invalid verification code");
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      {forgotLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 animate-spin" size={18} /> Verifying...
                        </span>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                  </div>
                )}

                {/* Step 3: Enter & Confirm New Password */}
                {forgotStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-[#64748B] text-sm">
                      Create a strong new password with at least 6 characters.
                    </p>

                    {/* New Password */}
                    <div className="relative group">
                      <label className="vibe-auth-label group-focus-within:text-[#6D3DF5]">New Password</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="vibe-auth-input pr-11 font-medium"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group">
                      <label className="vibe-auth-label group-focus-within:text-[#6D3DF5]">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="vibe-auth-input pr-11 font-medium"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Validation Hints */}
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-500">
                      <div className={`flex items-center gap-1.5 ${newPassword.length >= 6 ? 'text-emerald-600 font-semibold' : ''}`}>
                        <Check size={13} className={newPassword.length >= 6 ? 'text-emerald-500' : 'text-slate-300'} />
                        <span>At least 6 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? 'text-emerald-600 font-semibold' : ''}`}>
                        <Check size={13} className={newPassword && newPassword === confirmPassword ? 'text-emerald-500' : 'text-slate-300'} />
                        <span>Passwords match</span>
                      </div>
                    </div>

                    <Button 
                      fullWidth
                      disabled={forgotLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="!bg-[#6D3DF5] hover:!bg-[#5B2ED0] focus:!ring-[#6D3DF5] !py-3 !rounded-xl !font-bold"
                      onClick={async () => {
                        if (newPassword.length < 6) {
                          toast.error("Password must be at least 6 characters");
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          toast.error("Passwords do not match");
                          return;
                        }
                        setForgotLoading(true);
                        try {
                          await auth.resetPassword(forgotEmail.trim(), forgotOtp.trim(), newPassword);
                          toast.success("Password reset successfully! You can now log in.");
                          setEmail(forgotEmail.trim()); // Pre-fill login input
                          setShowForgotModal(false);
                          setForgotStep(1);
                          setForgotOtp('');
                          setNewPassword('');
                          setConfirmPassword('');
                        } catch (err) {
                          toast.error(err.message || "Failed to reset password");
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      {forgotLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 animate-spin" size={18} /> Updating Password...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Input Field (Scoped to Login)
const InputField = ({ label, icon, type = 'text', placeholder, value, onChange }) => (
  <div className="relative group">
    <label className="vibe-auth-label group-focus-within:text-[#6D3DF5]">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#6D3DF5] transition-colors">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="vibe-auth-input font-medium"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default Login;

