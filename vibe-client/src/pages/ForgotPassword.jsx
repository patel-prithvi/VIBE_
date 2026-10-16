import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  KeyRound,
  Check
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import { useToast } from '../components/Toast';
import { auth } from '../utils/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Wizard Step: 1 = Email, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & Timer States
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Prefill email from query parameter if provided (e.g. from profile)
  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await auth.forgotPassword(cleanEmail);
      toast.success('Verification code sent to your email!');
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      toast.success('New verification code sent!');
      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error('Please enter the full 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await auth.verifyResetOtp(email.trim(), cleanOtp);
      toast.success('Code verified successfully!');
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await auth.resetPassword(email.trim(), otp.trim(), newPassword);
      toast.success('Password updated successfully!');
      setStep(4);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for password strength indication
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6D3DF5]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#FF6B00]/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg relative z-10"
      >
        <GlassCard className="!p-8 sm:!p-10 shadow-2xl bg-white/95 border-slate-200 backdrop-blur-xl rounded-3xl">
          {/* Step Progress Pills */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-10 bg-[#6D3DF5]'
                      : s < step
                      ? 'w-6 bg-emerald-500'
                      : 'w-6 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#6D3DF5]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#6D3DF5] shadow-inner">
                    <KeyRound size={30} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    Forgot Password?
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                    Enter the email linked to your VIBE account and we'll send you a 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading || !email.trim()}
                    className="!rounded-xl !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !font-bold !py-3.5 shadow-lg shadow-[#6D3DF5]/25 focus:!ring-[#6D3DF5]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 animate-spin" size={19} /> Sending Code...
                      </span>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>

                  <div className="pt-2 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#6D3DF5] transition-colors group"
                    >
                      <ArrowLeft size={16} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Enter & Verify OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#6D3DF5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#6D3DF5] shadow-inner">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    We sent a 6-digit code to <br />
                    <span className="font-bold text-slate-800">{email}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                    }}
                    className="text-xs font-semibold text-[#6D3DF5] hover:underline mt-1 inline-block"
                  >
                    Wrong email? Change address
                  </button>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
                      6-Digit Verification Code
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(val);
                        }}
                        placeholder="123456"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 text-center text-slate-900 text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                    <span>Valid for 10 minutes</span>
                    {resendCooldown > 0 ? (
                      <span className="text-slate-400">
                        Resend in <b className="text-[#6D3DF5]">{resendCooldown}s</b>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-[#6D3DF5] font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={isLoading || otp.length < 6}
                      className="!rounded-xl !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !font-bold !py-3.5 shadow-lg shadow-[#6D3DF5]/25 focus:!ring-[#6D3DF5]"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 animate-spin" size={19} /> Verifying...
                        </span>
                      ) : (
                        'Verify Code'
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-center text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors py-1"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: Create New Password */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
                    <Lock size={30} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    Create New Password
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                    Choose a secure password with at least 6 characters.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* New Password Field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10 transition-all font-medium text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10 transition-all font-medium text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Validation Criteria */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      <Check size={14} className={hasMinLength ? 'text-emerald-500' : 'text-slate-300'} />
                      <span>At least 6 characters long</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      <Check size={14} className={passwordsMatch ? 'text-emerald-500' : 'text-slate-300'} />
                      <span>Passwords match</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading || !hasMinLength || !passwordsMatch}
                    className="!rounded-xl !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !font-bold !py-3.5 shadow-lg shadow-[#6D3DF5]/25 focus:!ring-[#6D3DF5]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 animate-spin" size={19} /> Updating Password...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: Success & Redirect */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
                  <CheckCircle2 size={46} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  Password Reset Complete!
                </h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                  Your password has been securely updated. You can now log into your account with your new credentials.
                </p>

                <div className="space-y-3">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="!rounded-xl !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !font-bold !py-3.5 shadow-lg shadow-[#6D3DF5]/25"
                  >
                    Return to Login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
