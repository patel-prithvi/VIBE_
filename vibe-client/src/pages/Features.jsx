import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Lightbulb,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Heart,
  Plus,
  Minus,
  CheckCircle,
  Gem,
  LayoutGrid,
  MessageSquare,
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
const Features = () => {
  // State for FAQ Accordion (Item 0 open by default as in screenshot)
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "What is VIBE?",
      a: "VIBE is a community-driven platform for students and faculty to connect, share, and grow together. It brings communities, mentorship, resources, events, and opportunities into one place.",
    },
    {
      q: "Who can join VIBE?",
      a: "Students and faculty members from verified colleges and universities can join using their institutional or personal email to collaborate in trusted academic spaces.",
    },
    {
      q: "Is VIBE free to use?",
      a: "Yes! VIBE is free for students and faculty to connect, explore resources, share knowledge, and collaborate on projects.",
    },
    {
      q: "How do I find a mentor?",
      a: "You can explore faculty and industry mentor profiles, review their domains of expertise, and submit mentorship requests directly through your dashboard.",
    },
    {
      q: "Can I create my own community?",
      a: "Absolutely! Students and faculty can start project circles, tech clubs, and study groups to share ideas and hold discussions.",
    },
    {
      q: "How are opportunities verified?",
      a: "All internships, research projects, and tasks are submitted by verified faculty mentors or industry partners, ensuring genuine career impact.",
    },
    {
      q: "Is my data safe?",
      a: "Yes. We take privacy seriously with encrypted data handling, secure authentication, and institutional-grade protection standards.",
    },
  ];

  return (
    <div className="roboto-bold min-h-screen bg-white text-[#111B5E] pt-20 overflow-x-hidden selection:bg-[#7540F5] selection:text-white">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (TWO-COLUMN)                            */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Floating Doodles (Home-style gentle floaters) */}
        <div className="absolute top-8 left-6 hidden sm:block pointer-events-none vibe-doodle-float-1">
          <SparkDoodle color="#FBBF24" size={32} />
        </div>
        <div className="absolute top-10 right-10 hidden sm:block pointer-events-none vibe-doodle-float-2">
          <LoopDoodle color="#F472B6" size={36} />
        </div>
        <div className="absolute bottom-10 left-10 hidden md:block pointer-events-none vibe-doodle-float-2">
          <SpiralDoodle color="#7540F5" size={28} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDF7FF] border border-[#D3E3EE] text-[#2F6DB5] text-xs font-bold uppercase tracking-wider"
            >
              <ShieldCheck size={14} className="text-[#16A34A]" />
              <span>Features • All in one place</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111B5E] leading-[1.14]"
            >
              Everything you need to{" "}
              <span className="relative inline-block text-[#7540F5]">
                Learn, Connect and Grow
                <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full pointer-events-none" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-[#5A6482] font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Discover powerful features designed for students and faculty to share knowledge, collaborate on projects, and unlock new opportunities — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                to="/signup"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-[0_8px_24px_rgba(117,64,245,0.28)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.36)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Join VIBE</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/how-it-works"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-full text-base font-bold text-[#111B5E] bg-white border border-slate-200 hover:border-[#7540F5] hover:text-[#7540F5] transition-all flex items-center justify-center gap-1.5"
              >
                <span>How it works</span>
              </Link>
            </motion.div>

            {/* Trust Proof Micro-Banner (Home-style) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-[#5A6482]"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#16A34A]" /> 6 Core Modules
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#16A34A]" /> Verified Community
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#16A34A]" /> 100% Free for Students
              </span>
            </motion.div>
          </div>

          {/* Right Image Column with floating feature pills */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                alt="Student using VIBE"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Tags */}
            <span className="absolute -top-3 left-6 px-3.5 py-1 bg-white/95 backdrop-blur-md text-[#7540F5] text-xs font-bold rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5">
              <Users size={13} /> Communities
            </span>
            <span className="absolute top-1/4 -right-4 px-3.5 py-1 bg-white/95 backdrop-blur-md text-[#0284C7] text-xs font-bold rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5">
              <GraduationCap size={13} /> Mentorship
            </span>
            <span className="absolute -bottom-3 left-10 px-3.5 py-1 bg-white/95 backdrop-blur-md text-[#16A34A] text-xs font-bold rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5">
              <Calendar size={13} /> Events
            </span>
            <span className="absolute bottom-1/4 -right-2 px-3.5 py-1 bg-white/95 backdrop-blur-md text-[#D97706] text-xs font-bold rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5">
              <BookOpen size={13} /> Resources
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION: OUR FEATURES (6 GRID CARDS)                  */}
      {/* ======================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#111B5E] tracking-tight leading-tight">
            Our Features
          </h2>
          <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">
            Explore everything VIBE offers to help you build meaningful connections and create new opportunities.
          </p>

        {/* 6 Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
          {/* Card 1: Communities */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111B5E]">Communities</h3>
                <ArrowRight size={16} className="text-[#0284C7] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-[#5A6482] leading-relaxed">
                Join interest-based communities, share ideas, ask questions, and collaborate with students and faculty who share your passions.
              </p>
            </div>
          </div>

          {/* Card 2: Mentorship */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111B5E]">Mentorship</h3>
                <ArrowRight size={16} className="text-[#DB2777] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-[#5A6482] leading-relaxed">
                Connect with experienced faculty for guidance on academics, research, career, and personal growth.
              </p>
            </div>
          </div>

          {/* Card 3: Resources */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111B5E]">Resources</h3>
                <ArrowRight size={16} className="text-[#D97706] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-[#5A6482] leading-relaxed">
                Access curated learning resources, research materials, project ideas, and career guidance to support your journey.
              </p>
            </div>
          </div>

          {/* Card 4: Events */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111B5E]">Events</h3>
                <ArrowRight size={16} className="text-[#16A34A] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-[#5A6482] leading-relaxed">
                Discover and participate in workshops, webinars, meetups, internships, and other opportunities.
              </p>
            </div>
          </div>

          {/* Card 5: Collaboration */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Lightbulb size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111B5E]">Collaboration</h3>
                <ArrowRight size={16} className="text-[#9333EA] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-[#5A6482] leading-relaxed">
                Find people to work on projects, share skills, and turn your ideas into real-world solutions.
              </p>
            </div>
          </div>

          {/* Card 6: Opportunities */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111B5E]">Opportunities</h3>
                <ArrowRight size={16} className="text-[#EA580C] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-2 text-sm text-[#5A6482] leading-relaxed">
                Stay updated with internships, research projects, competitions, and other career opportunities across campuses.
              </p>
            </div>
          </div>
        </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION: WHY CHOOSE VIBE?                             */}
      {/* ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EDF7FF] text-[#2F6DB5] flex items-center justify-center mx-auto mb-4 shadow-xs border border-[#D3E3EE]">
            <Heart size={22} />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#111B5E] tracking-tight leading-tight">
            Why Choose VIBE?
          </h2>
          <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">
            More than just a platform — VIBE is a supportive community built for your growth.
          </p>

        {/* Central Graphic with 6 Surrounding Value Props */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">
          {/* Left Column (3 items) */}
          <div className="space-y-6 text-left">
            <div className="bg-[#FAF5FF] p-5 rounded-2xl border border-[#F3E8FF] space-y-1">
              <div className="flex items-center gap-2.5 text-[#7540F5]">
                <GraduationCap size={20} />
                <h4 className="font-bold text-[#111B5E]">Student & Faculty Together</h4>
              </div>
              <p className="text-xs text-[#5A6482] leading-relaxed">
                A platform where students and faculty can learn, share, and grow together.
              </p>
            </div>

            <div className="bg-[#EFF6FF] p-5 rounded-2xl border border-[#DBEAFE] space-y-1">
              <div className="flex items-center gap-2.5 text-[#2563EB]">
                <Users size={20} />
                <h4 className="font-bold text-[#111B5E]">Supportive Community</h4>
              </div>
              <p className="text-xs text-[#5A6482] leading-relaxed">
                Be part of a positive and inclusive community that encourages curiosity and collaboration.
              </p>
            </div>

            <div className="bg-[#FDF2F8] p-5 rounded-2xl border border-[#FCE7F3] space-y-1">
              <div className="flex items-center gap-2.5 text-[#DB2777]">
                <Briefcase size={20} />
                <h4 className="font-bold text-[#111B5E]">Real Opportunities</h4>
              </div>
              <p className="text-xs text-[#5A6482] leading-relaxed">
                Get access to internships, research projects, events, and career opportunities.
              </p>
            </div>
          </div>

          {/* Center Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[3/4]">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"
              alt="Why Choose VIBE"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Column (3 items) */}
          <div className="space-y-6 text-left">
            <div className="bg-[#F0FDF4] p-5 rounded-2xl border border-[#DCFCE7] space-y-1">
              <div className="flex items-center gap-2.5 text-[#16A34A]">
                <Gem size={20} />
                <h4 className="font-bold text-[#111B5E]">Verified & Trusted</h4>
              </div>
              <p className="text-xs text-[#5A6482] leading-relaxed">
                A safe and reliable space for meaningful academic and professional connections.
              </p>
            </div>

            <div className="bg-[#FEF3C7] p-5 rounded-2xl border border-[#FDE68A] space-y-1">
              <div className="flex items-center gap-2.5 text-[#D97706]">
                <LayoutGrid size={20} />
                <h4 className="font-bold text-[#111B5E]">All in One Place</h4>
              </div>
              <p className="text-xs text-[#5A6482] leading-relaxed">
                Communities, mentorship, resources, events, and opportunities — everything you need, in one platform.
              </p>
            </div>

            <div className="bg-[#ECFEFF] p-5 rounded-2xl border border-[#CFFAFE] space-y-1">
              <div className="flex items-center gap-2.5 text-[#0891B2]">
                <TrendingUp size={20} />
                <h4 className="font-bold text-[#111B5E]">Built for Growth</h4>
              </div>
              <p className="text-xs text-[#5A6482] leading-relaxed">
                Gain new skills, build your network, and unlock opportunities to shape a brighter future.
              </p>
            </div>
          </div>
        </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 4. STATISTICS STRIP                                      */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]"><CountUpNumber target={10000} suffix="+" /></p>
              <p className="text-xs text-[#5A6482] font-semibold">Members</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0">
              <LayoutGrid size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]"><CountUpNumber target={2000} suffix="+" /></p>
              <p className="text-xs text-[#5A6482] font-semibold">Communities</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]"><CountUpNumber target={5000} suffix="+" /></p>
              <p className="text-xs text-[#5A6482] font-semibold">Posts Shared</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]"><CountUpNumber target={120} suffix="+" /></p>
              <p className="text-xs text-[#5A6482] font-semibold">Colleges & Institutes</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 5. FAQ SECTION (ACCORDION)                               */}
      {/* ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <MessageSquare size={22} />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#111B5E] tracking-tight leading-tight">
            Frequently{" "}
            <span className="relative inline-block text-[#7540F5]">
              Asked
              <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full" />
            </span>{" "}
            Questions
          </h2>
          <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">Got questions? We've got answers.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Visual: Thinking Student */}
          <div className="md:col-span-5 relative text-center">
            <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] max-w-sm mx-auto">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                alt="Have Questions?"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 text-xs font-bold text-[#111B5E]">
              Have Questions? We're here to help! 💬
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="md:col-span-7 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#111B5E] hover:text-[#7540F5] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className="w-7 h-7 rounded-full bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center flex-shrink-0">
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5A6482] leading-relaxed border-t border-slate-50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CLOSING CTA BANNER                                    */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-8">
        <div className="bg-[#F5F1FF] border border-[#E9E1FF] rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white text-[#7540F5] text-xs font-black uppercase tracking-wider shadow-2xs">
              Ready to get started?
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111B5E] tracking-tight leading-tight">
              Join VIBE and be part of a supportive community that believes in your potential.
            </h2>

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

export default Features;
