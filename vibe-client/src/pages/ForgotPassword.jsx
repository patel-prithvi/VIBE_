
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden bg-[#FAFAFA]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B00]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="!p-10 shadow-2xl bg-white border-slate-200">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#FF6B00] relative">
                    <Zap size={32} />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-[#FF6B00]/20 rounded-2xl"
                    />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h2>
                  <p className="text-slate-500 text-sm">
                    Enter the email associated with your account and we'll send a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1 group-focus-within:text-[#FF6B00] transition-colors">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF6B00] transition-all" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 transition-all font-medium"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} /> Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm font-bold text-slate-400 hover:text-[#FF6B00] transition-colors group"
                  >
                    <ArrowLeft size={16} className="mr-2 group-hover:scale-110 transition-transform" />
                    Back to Login
                  </Link>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Check your email</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  We've sent a password reset link to <br />
                  <span className="font-bold text-slate-800">{email}</span>
                </p>
                <div className="space-y-4">
                  <Link to="/login">
                    <Button fullWidth variant="primary" size="lg">Return to Login</Button>
                  </Link>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm font-bold text-[#FF6B00] hover:underline"
                  >
                    Didn't receive the email? Try again
                  </button>
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
