import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  UserCheck,
  Compass,
  MessageSquare,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
} from "lucide-react";
import {
  HandUnderline,
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
} from "../components/public/Doodles";

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNT-UP NUMBER (Home-style viewport trigger)
// ─────────────────────────────────────────────────────────────────────────────
const CountUpNumber = ({ target, suffix = "", duration = 1.6 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums font-black">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const HowItWorks = () => {
  return (
    <div className="roboto-bold min-h-screen bg-white text-[#111B5E] pt-20 overflow-x-hidden selection:bg-[#7540F5] selection:text-white">
      {/* ======================================================== */}
      {/* 1. HERO INTRO SECTION                                    */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Floating Doodles (Home-style gentle floaters) */}
        <div className="absolute top-8 left-6 hidden sm:block pointer-events-none vibe-doodle-float-1">
          <SparkDoodle color="#FBBF24" size={32} />
        </div>
        <div className="absolute top-10 right-10 hidden sm:block pointer-events-none vibe-doodle-float-2">
          <LoopDoodle color="#F472B6" size={36} />
        </div>
        <div className="absolute bottom-24 left-10 hidden md:block pointer-events-none vibe-doodle-float-2">
          <SpiralDoodle color="#7540F5" size={28} />
        </div>
        <div className="absolute top-44 right-16 hidden lg:block pointer-events-none vibe-doodle-float-1">
          <StarDoodle color="#38BDF8" size={24} />
        </div>

        {/* Eyebrow Trust Line (Home-style) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDF7FF] border border-[#D3E3EE] text-[#2F6DB5] text-xs font-bold uppercase tracking-wider mb-6"
        >
          <ShieldCheck size={14} className="text-[#16A34A]" />
          <span>How it works • Simple by design</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-black tracking-tight leading-[1.14] text-[#111B5E] max-w-5xl mx-auto"
        >
          From Curiosity to{" "}
          <span className="relative inline-block text-[#7540F5]">
            Opportunity
            <HandUnderline color="#FBBF24" className="absolute -bottom-2.5 left-0 w-full pointer-events-none" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed"
        >
          VIBE makes it simple for students and faculty to connect, share, learn, and grow together — in just a few steps.
        </motion.p>

        {/* Dual CTA Buttons (Home-style) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/signup"
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-[0_8px_24px_rgba(117,64,245,0.28)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.36)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Join VIBE</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/features"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-full text-base font-bold text-[#111B5E] bg-white border border-slate-200 hover:border-[#7540F5] hover:text-[#7540F5] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Explore features</span>
          </Link>
        </motion.div>

        {/* Trust Proof Micro-Banner (Home-style) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#5A6482]"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#16A34A]" /> College Email Verified
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#16A34A]" /> 5 Simple Steps
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#16A34A]" /> 100% Free for Students
          </span>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. FIVE-STEP ALTERNATING STORYTELLING                   */}
      {/* ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        {/* -------------------------------------------------------- */}
        {/* STEP 1: JOIN VIBE                                        */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Left Visual: Student signing up with mock card */}
          <div className="relative group">
            <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[4/3] bg-gradient-to-tr from-[#EEF2FF] to-[#FAF5FF]">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                alt="Student joining VIBE"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Floating Mock Registration Card */}
            <div className="absolute -bottom-5 -right-3 sm:right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[220px]">
              <p className="text-xs font-bold text-[#111B5E] mb-2 flex items-center gap-1.5">
                <UserCheck size={14} className="text-[#7540F5]" /> Create Account
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="px-2.5 py-1 bg-[#F5F1FF] text-[#7540F5] font-semibold rounded-lg">
                  🎓 Student / Faculty
                </div>
                <div className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg">
                  ✉️ College Email
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-black text-xl flex items-center justify-center shadow-sm">
              1
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B5E]">Join VIBE</h2>
            <p className="text-[#5A6482] text-base leading-relaxed">
              Create your profile using your college email and become part of a trusted academic community.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-[#111B5E] block">Choose your role</span>
                <span className="text-[11px] text-[#5A6482]">(student or faculty)</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-[#111B5E] block">Add your interests</span>
                <span className="text-[11px] text-[#5A6482]">& verified skills</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-[#111B5E] block">Start exploring</span>
                <span className="text-[11px] text-[#5A6482]">right away</span>
              </div>
              </div>
            </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/* STEP 2: EXPLORE & DISCOVER                              */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Left Content */}
          <div className="space-y-4 order-2 md:order-1">
            <div className="w-12 h-12 rounded-full bg-[#F3E8FF] text-[#7E22CE] font-black text-xl flex items-center justify-center shadow-sm">
              2
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B5E]">Explore & Discover</h2>
            <p className="text-[#5A6482] text-base leading-relaxed">
              Find people, communities, resources, and opportunities that match your interests and goals.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <Users size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Browse communities</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Explore resources</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Discover upcoming events</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Find faculty mentors</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Student with backpack and floating tags */}
          <div className="relative group order-1 md:order-2">
            <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"
                alt="Student discovering opportunities"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Floating Tags */}
            <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md text-[#7540F5] text-xs font-bold rounded-full shadow-md border border-slate-100">
              Communities
            </span>
            <span className="absolute top-4 right-4 px-3 py-1 bg-white/95 backdrop-blur-md text-[#D97706] text-xs font-bold rounded-full shadow-md border border-slate-100">
              Resources
            </span>
            <span className="absolute bottom-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md text-[#16A34A] text-xs font-bold rounded-full shadow-md border border-slate-100">
              Events
            </span>
            <span className="absolute bottom-4 right-4 px-3 py-1 bg-white/95 backdrop-blur-md text-[#0284C7] text-xs font-bold rounded-full shadow-md border border-slate-100">
              Mentorship
            </span>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/* STEP 3: CONNECT & ENGAGE                                */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Left Visual: Students discussing with speech bubble */}
          <div className="relative group">
            <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                alt="Students collaborating"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Floating Speech Bubbles */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl rounded-bl-none shadow-lg text-xs font-bold text-[#111B5E] border border-slate-100 max-w-[190px]">
              Let's collaborate on this project! 💡
            </div>
            <div className="absolute bottom-4 right-4 bg-[#7540F5] text-white px-3.5 py-1.5 rounded-2xl rounded-tr-none shadow-lg text-xs font-bold">
              Sure! 🚀
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] font-black text-xl flex items-center justify-center shadow-sm">
              3
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B5E]">Connect & Engage</h2>
            <p className="text-[#5A6482] text-base leading-relaxed">
              Share ideas, ask questions, join discussions, and collaborate on projects with students and faculty across campuses.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Post and discuss ideas</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">React with Vibes</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Collaborate on projects</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Connect with mentors</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/* STEP 4: LEARN & GROW                                    */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Left Content */}
          <div className="space-y-4 order-2 md:order-1">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] font-black text-xl flex items-center justify-center shadow-sm">
              4
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B5E]">Learn & Grow</h2>
            <p className="text-[#5A6482] text-base leading-relaxed">
              Get guidance, attend events, access resources, and work on real opportunities to build your skills and career.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Join workshops and webinars</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Access curated resources</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0">
                  <Users size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Get mentorship guidance</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <Briefcase size={16} />
                </div>
                <span className="text-sm font-semibold text-[#111B5E]">Find internships and research opportunities</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Student with headphones and floating booking cards */}
          <div className="relative group order-1 md:order-2">
            <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
                alt="Student learning with mentor"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Floating Booking Cards */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 text-xs">
              <span className="font-bold text-[#111B5E] block">Workshop</span>
              <span className="text-[#5A6482] block text-[11px]">Web Development</span>
              <span className="mt-1 inline-block px-2.5 py-0.5 bg-[#7540F5] text-white font-bold rounded-full text-[10px]">
                Join
              </span>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 text-xs">
              <span className="font-bold text-[#111B5E] block">Mentor Guidance</span>
              <span className="text-[#5A6482] block text-[11px]">Career & Research</span>
              <span className="mt-1 inline-block px-2.5 py-0.5 bg-[#7540F5] text-white font-bold rounded-full text-[10px]">
                Book a Session
              </span>
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/* STEP 5: UNLOCK OPPORTUNITIES                            */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Left Visual: Celebrating student */}
          <div className="relative group">
            <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
                alt="Student succeeding"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="absolute top-4 left-4 p-2 bg-white rounded-xl shadow-md text-amber-500">
              <Award size={22} />
            </span>
            <span className="absolute bottom-4 right-4 p-2 bg-white rounded-xl shadow-md text-indigo-500">
              <GraduationCap size={22} />
            </span>
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFE4E6] text-[#E11D48] font-black text-xl flex items-center justify-center shadow-sm">
              5
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B5E]">Unlock Opportunities</h2>
            <p className="text-[#5A6482] text-base leading-relaxed">
              Turn your learning into real outcomes — internships, collaborations, projects, and a stronger future.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Showcase your work</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Get noticed by mentors</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Apply for verified opportunities</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <CheckCircle2 size={18} className="text-[#7540F5]" />
                <span className="text-sm font-semibold text-[#111B5E]">Build your academic and career journey</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* ANIMATED STAT COUNTERS (Home-style)                      */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-tight text-[#111B5E] leading-tight">
            Loved by campuses across the country
          </h2>

          <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">
            From first-year exploration to verified placement — VIBE keeps every step transparent.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EDF7FF] text-[#2F6DB5] flex items-center justify-center mb-3">
                <GraduationCap size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={15000} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Verified Students
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={1200} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Faculty Mentors
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
                <Briefcase size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={450} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Industry Partners
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                <Award size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={98} suffix="%" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Verified Completion
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 3. CLOSING CTA BANNER                                    */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-8">
        <div className="bg-[#F5F1FF] border border-[#E9E1FF] rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white text-[#7540F5] text-xs font-black uppercase tracking-wider shadow-2xs">
              Ready to get started?
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111B5E] tracking-tight leading-tight">
              Your ideas. Your people. <br />
              A brighter tomorrow.
            </h2>

            <p className="text-base sm:text-lg text-[#5A6482] leading-relaxed">
              Join thousands of students and mentors already growing together on VIBE.
            </p>

            {/* Quick Role Badges inside CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Link
                to="/signup/student"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#7540F5] text-[#111B5E] hover:text-white border border-slate-200/90 text-xs font-bold transition-colors"
              >
                For Students
              </Link>
              <Link
                to="/signup/faculty"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#7540F5] text-[#111B5E] hover:text-white border border-slate-200/90 text-xs font-bold transition-colors"
              >
                For Mentors
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
            <Link
              to="/signup"
              className="min-h-[48px] px-8 py-4 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-[0_8px_24px_rgba(117,64,245,0.3)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group"
            >
              <span>Get started — It's Free</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <span className="text-xs text-[#5A6482]">
              No credit card required • Instant verification
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
