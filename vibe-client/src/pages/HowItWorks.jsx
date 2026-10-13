import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UserCheck,
  Compass,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  CheckCircle2,
  Award,
  Zap,
} from "lucide-react";
import {
  HandUnderline,
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
  WavyConnector,
} from "../components/public/Doodles";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white text-[#111B5E] pt-24 overflow-hidden selection:bg-[#7540F5] selection:text-white">
      {/* ======================================================== */}
      {/* 1. HERO INTRO SECTION                                    */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Floating Doodles */}
        <div className="absolute top-10 left-8 hidden sm:block">
          <SparkDoodle color="#FBBF24" size={30} />
        </div>
        <div className="absolute top-14 right-10 hidden sm:block">
          <LoopDoodle color="#F472B6" size={34} />
        </div>
        <div className="absolute bottom-10 left-16 hidden sm:block">
          <SpiralDoodle color="#7540F5" size={28} />
        </div>

        {/* Eyebrow Label */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 rounded-full bg-[#F5F1FF] text-[#7540F5] text-xs font-black uppercase tracking-widest mb-4"
        >
          HOW IT WORKS
        </motion.span>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111B5E] max-w-3xl mx-auto leading-tight"
        >
          From Curiosity to{" "}
          <span className="relative inline-block text-[#7540F5]">
            Opportunity
            <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed"
        >
          VIBE makes it simple for students and faculty to connect, share, learn, and grow together — in just a few steps.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-lg shadow-[#7540F5]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group"
          >
            <span>Join VIBE</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. FIVE-STEP ALTERNATING STORYTELLING                   */}
      {/* ======================================================== */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
        {/* -------------------------------------------------------- */}
        {/* STEP 1: JOIN VIBE                                        */}
        {/* -------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
                <Sparkles size={14} className="text-[#7540F5]" /> Create Account
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
        </div>

        <WavyConnector />

        {/* -------------------------------------------------------- */}
        {/* STEP 2: EXPLORE & DISCOVER                              */}
        {/* -------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
        </div>

        <WavyConnector />

        {/* -------------------------------------------------------- */}
        {/* STEP 3: CONNECT & ENGAGE                                */}
        {/* -------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
        </div>

        <WavyConnector />

        {/* -------------------------------------------------------- */}
        {/* STEP 4: LEARN & GROW                                    */}
        {/* -------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
        </div>

        <WavyConnector />

        {/* -------------------------------------------------------- */}
        {/* STEP 5: UNLOCK OPPORTUNITIES                            */}
        {/* -------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CLOSING CTA BANNER                                    */}
      {/* ======================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#F5F1FF] border border-[#E9E1FF] rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-lg text-center md:text-left">
            <span className="text-xs font-bold text-[#7540F5] tracking-widest uppercase">READY TO GET STARTED?</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111B5E] tracking-tight leading-tight">
              Your ideas. Your people. <br />
              A brighter tomorrow.
            </h2>
            <div className="pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-lg shadow-[#7540F5]/25 hover:shadow-xl transition-all"
              >
                <span>Join VIBE</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80"
              alt="Students collaborating"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
