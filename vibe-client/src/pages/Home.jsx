import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  GraduationCap,
  Heart,
  Lightbulb,
  Briefcase,
  Code,
  MapPin,
  Clock,
  ThumbsUp,
  Share2,
} from "lucide-react";
import {
  HandUnderline,
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
  PureConnector,
  BridgeConnector,
} from "../components/public/Doodles";


const Home = () => {
  return (
    <div className="min-h-screen bg-white text-[#111B5E] pt-24 overflow-x-hidden selection:bg-[#7540F5] selection:text-white">
      {/* Scoped subtle floating animations for VIBE Landing Page */}
      <style>{`
        @keyframes vibeFloatDoodle1 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(4px, -7px, 0); }
        }
        @keyframes vibeFloatDoodle2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-5px, 6px, 0); }
        }
        @keyframes vibeFloatDoodle3 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(4px, -6px, 0); }
        }
        @keyframes vibeFloatDoodle4 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-4px, -8px, 0); }
        }
        @keyframes vibeFloatUnderline {
          0%, 100% { transform: translate3d(0, 0, 0) scaleX(1); }
          50% { transform: translate3d(3px, 1.5px, 0) scaleX(1.02); }
        }
        @keyframes vibeFloatAvatars {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -2.5px, 0); }
        }
        @keyframes vibeFloatCardUp {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -6px, 0); }
        }
        @keyframes vibeFloatCardDown {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 6px, 0); }
        }
        @keyframes vibeFloatCardUpAlt {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -7px, 0); }
        }
        @keyframes vibeFloatCardDownAlt {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 5px, 0); }
        }
        @keyframes vibeFloatBubble1 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(3px, -6px, 0); }
        }
        @keyframes vibeFloatBubble2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-4px, 5px, 0); }
        }
        @keyframes vibeFloatBubble3 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(4px, 6px, 0); }
        }

        .vibe-landing-doodle-1 {
          animation: vibeFloatDoodle1 4.2s ease-in-out infinite;
          will-change: transform;
        }
        .vibe-landing-doodle-2 {
          animation: vibeFloatDoodle2 4.9s ease-in-out 0.6s infinite;
          will-change: transform;
        }
        .vibe-landing-doodle-3 {
          animation: vibeFloatDoodle3 5.3s ease-in-out 1.1s infinite;
          will-change: transform;
        }
        .vibe-landing-doodle-4 {
          animation: vibeFloatDoodle4 3.9s ease-in-out 0.3s infinite;
          will-change: transform;
        }
        .vibe-landing-underline {
          animation: vibeFloatUnderline 4.6s ease-in-out 0.4s infinite;
          will-change: transform;
        }
        .vibe-landing-avatars {
          animation: vibeFloatAvatars 5.4s ease-in-out 0.8s infinite;
          will-change: transform;
        }
        .vibe-landing-card-1 {
          animation: vibeFloatCardUp 4.6s ease-in-out 0s infinite;
          will-change: transform;
        }
        .vibe-landing-card-2 {
          animation: vibeFloatCardDown 5.2s ease-in-out 0.7s infinite;
          will-change: transform;
        }
        .vibe-landing-card-3 {
          animation: vibeFloatCardUpAlt 4.9s ease-in-out 1.3s infinite;
          will-change: transform;
        }
        .vibe-landing-card-4 {
          animation: vibeFloatCardDownAlt 5.5s ease-in-out 0.4s infinite;
          will-change: transform;
        }
        .vibe-landing-bubble-1 {
          animation: vibeFloatBubble1 4.7s ease-in-out 0.2s infinite;
          will-change: transform;
        }
        .vibe-landing-bubble-2 {
          animation: vibeFloatBubble2 5.1s ease-in-out 0.9s infinite;
          will-change: transform;
        }
        .vibe-landing-bubble-3 {
          animation: vibeFloatBubble3 4.4s ease-in-out 1.4s infinite;
          will-change: transform;
        }
        .vibe-landing-bubble-4 {
          animation: vibeFloatBubble2 5.4s ease-in-out 0.5s infinite;
          will-change: transform;
        }
        .vibe-landing-bubble-5 {
          animation: vibeFloatBubble1 5.0s ease-in-out 1.1s infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .vibe-landing-doodle-1,
          .vibe-landing-doodle-2,
          .vibe-landing-doodle-3,
          .vibe-landing-doodle-4,
          .vibe-landing-underline,
          .vibe-landing-avatars,
          .vibe-landing-card-1,
          .vibe-landing-card-2,
          .vibe-landing-card-3,
          .vibe-landing-card-4,
          .vibe-landing-bubble-1,
          .vibe-landing-bubble-2,
          .vibe-landing-bubble-3,
          .vibe-landing-bubble-4,
          .vibe-landing-bubble-5 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. HERO SECTION                                         */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Floating Doodles around Hero */}
        <div className="absolute top-8 left-8 hidden sm:block pointer-events-none vibe-landing-doodle-1">
          <SparkDoodle color="#FBBF24" size={32} />
        </div>
        <div className="absolute top-12 right-12 hidden sm:block pointer-events-none vibe-landing-doodle-2">
          <LoopDoodle color="#F472B6" size={36} />
        </div>
        <div className="absolute bottom-16 left-12 hidden sm:block pointer-events-none vibe-landing-doodle-3">
          <SpiralDoodle color="#7540F5" size={30} />
        </div>
        <div className="absolute top-40 right-20 hidden md:block pointer-events-none vibe-landing-doodle-4">
          <StarDoodle color="#38BDF8" size={24} />
        </div>

        {/* Main Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.15] text-[#111B5E] max-w-4xl mx-auto"
        >
          A community where students and faculty grow{" "}
          <span className="relative inline-block text-[#7540F5]">
            together
            <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full pointer-events-none vibe-landing-underline" />
          </span>
        </motion.h1>

        {/* Supporting Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Share ideas, get guidance, collaborate on projects, and discover new opportunities — all in one place.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-lg shadow-[#7540F5]/25 hover:shadow-xl hover:shadow-[#7540F5]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group"
          >
            <span>Join VIBE</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Social Proof Avatars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-[#5A6482]"
        >
          <div className="flex -space-x-2 vibe-landing-avatars">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
              alt="Member"
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces"
              alt="Member"
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
              alt="Member"
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
              alt="Member"
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
            />
          </div>
          <p>
            <strong className="text-[#111B5E] font-bold">10K+ students and faculty</strong> already on VIBE
          </p>
        </motion.div>

        {/* ======================================================== */}
        {/* HERO COLLAGE (STUDENTS & FACULTY COLLABORATING)          */}
        {/* ======================================================== */}
        <div className="relative mt-14 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-center">
            {/* Collage Item 1: Group working on laptop */}
            <div className="relative group rounded-3xl overflow-hidden shadow-md border-2 border-white hover:shadow-xl transition-shadow col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[3/4] vibe-landing-card-1">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                alt="Students collaborating"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md text-[#111B5E] text-xs font-bold rounded-full shadow-sm flex items-center gap-1 border border-slate-100">
                <Lightbulb size={12} className="text-[#FBBF24]" /> Ideas
              </span>
            </div>

            {/* Collage Item 2: Two students discussing */}
            <div className="relative group rounded-3xl overflow-hidden shadow-md border-2 border-white hover:shadow-xl transition-shadow aspect-[4/3] md:aspect-[3/4] vibe-landing-card-2">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"
                alt="Students studying"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md text-[#111B5E] text-xs font-bold rounded-full shadow-sm flex items-center gap-1 border border-slate-100">
                <Code size={12} className="text-[#F97316]" /> Projects
              </span>
            </div>

            {/* Collage Item 3: Faculty Mentor smiling */}
            <div className="relative group rounded-3xl overflow-hidden shadow-md border-2 border-white hover:shadow-xl transition-shadow aspect-[4/3] md:aspect-[3/4] vibe-landing-card-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
                alt="Faculty Mentor"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-md text-[#111B5E] text-xs font-bold rounded-full shadow-sm flex items-center gap-1 border border-slate-100">
                <GraduationCap size={12} className="text-[#7540F5]" /> Mentorship
              </span>
            </div>

            {/* Collage Item 4: Two female students with books */}
            <div className="relative group rounded-3xl overflow-hidden shadow-md border-2 border-white hover:shadow-xl transition-shadow col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[3/4] vibe-landing-card-4">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80"
                alt="College peers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-md text-[#111B5E] text-xs font-bold rounded-full shadow-sm flex items-center gap-1 border border-slate-100">
                <Sparkles size={12} className="text-[#A45AFF]" /> Opportunities
              </span>
            </div>
          </div>
        </div>

        {/* Connector: Hero collage → Stay connected */}
        <PureConnector variant="right-arc" className="mt-8 mb-2 sm:mt-10 sm:mb-2" />
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION: STAY CONNECTED — INSTANTLY                   */}
      {/* ======================================================== */}
      <section className="relative pt-4 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        {/* Icon Pill Badge */}
        <div className="w-12 h-12 rounded-full bg-[#EDF7FF] text-[#2F6DB5] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Users size={22} />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
          Stay connected — instantly
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#5A6482] max-w-xl mx-auto">
          Join a vibrant community of learners, creators, and mentors from colleges and universities across the globe.
        </p>

        {/* Chat Illustration Mock Surface */}
        <div className="mt-10 bg-gradient-to-b from-[#EDF7FF]/90 to-[#F5F1FF]/60 rounded-3xl p-6 sm:p-10 border border-[#EDF7FF] max-w-2xl mx-auto shadow-sm relative text-left">
          <div className="space-y-4">
            {/* Message 1 */}
            <div className="flex items-start gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
                alt="Aman"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm max-w-md border border-slate-100">
                <p className="text-xs font-bold text-[#111B5E] mb-1">Aman</p>
                <p className="text-xs sm:text-sm text-slate-700">
                  Anyone interested in a web development project this semester?
                </p>
                <span className="text-[10px] text-slate-400 block text-right mt-1">10:24 AM</span>
              </div>
            </div>

            {/* Message 2 (Right-aligned response) */}
            <div className="flex items-start justify-end gap-3">
              <div className="bg-[#7540F5] text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm max-w-md">
                <p className="text-xs font-bold text-white/90 mb-1">Priya</p>
                <p className="text-xs sm:text-sm">
                  I'm in! Let's discuss further 🚀
                </p>
                <span className="text-[10px] text-white/70 block text-right mt-1">10:26 AM</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces"
                alt="Priya"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            </div>

            {/* Message 3 */}
            <div className="flex items-start gap-3">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=faces"
                alt="Sneha"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm max-w-md border border-slate-100">
                <p className="text-xs font-bold text-[#111B5E] mb-1">Sneha</p>
                <p className="text-xs sm:text-sm text-slate-700">
                  I can help with the UI/UX design part! ✨
                </p>
                <span className="text-[10px] text-slate-400 block text-right mt-1">10:28 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connector: Stay connected chat → Offer a window */}
        <PureConnector variant="left-arc" className="mt-8 mb-2 sm:mt-10 sm:mb-2" />
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION: OFFER A WINDOW INTO THEIR WORLD              */}
      {/* ======================================================== */}
      <section className="relative pt-4 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <MessageSquare size={22} />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
          Offer a window into their world
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#5A6482] max-w-xl mx-auto">
          Get to know students and faculty through posts, ideas, projects, achievements, and real experiences.
        </p>

        {/* Two Sample Post Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          {/* Post Card 1 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces"
                alt="Rohan Mehta"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-[#111B5E]">Rohan Mehta</h4>
                <p className="text-xs text-[#5A6482]">3 hours ago</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden mb-3 aspect-video bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80"
                alt="AI Discussion"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-slate-800 font-medium mb-4">
              Great discussion on AI and its real-world applications! 💡
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#5A6482] pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 hover:text-[#7540F5] cursor-pointer">
                <ThumbsUp size={14} className="text-[#7540F5]" /> 124 vibes
              </span>
              <span className="flex items-center gap-1 hover:text-[#7540F5] cursor-pointer">
                <MessageSquare size={14} /> 28 comments
              </span>
            </div>
          </div>

          {/* Post Card 2 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces"
                alt="Dr. Meera Sharma"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-[#111B5E]">Dr. Meera Sharma</h4>
                <p className="text-xs text-[#5A6482]">1 day ago</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden mb-3 aspect-video bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80"
                alt="Research Mentorship"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-slate-800 font-medium mb-4">
              Excited to mentor students on their research projects! 🎓
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#5A6482] pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 hover:text-[#7540F5] cursor-pointer">
                <ThumbsUp size={14} className="text-[#7540F5]" /> 310 vibes
              </span>
              <span className="flex items-center gap-1 hover:text-[#7540F5] cursor-pointer">
                <MessageSquare size={14} /> 45 comments
              </span>
            </div>
          </div>
        </div>

        {/* Connector: Post cards → Events schedule */}
        <PureConnector variant="right-arc" className="mt-8 mb-2 sm:mt-10 sm:mb-2" />
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION: KEEP EVERYONE UP-TO-DATE                     */}
      {/* ======================================================== */}
      <section className="relative pt-4 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Calendar size={22} />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
          Keep everyone up-to-date
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#5A6482] max-w-xl mx-auto">
          Discover upcoming events, workshops, webinars, internships, and deadlines — never miss an opportunity.
        </p>

        {/* Event Cards Container */}
        <div className="mt-10 bg-[#F5F1FF]/70 rounded-3xl p-6 sm:p-8 border border-[#E9E1FF] max-w-2xl mx-auto space-y-4 text-left">
          {/* Event 1 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-extrabold uppercase">OCT</span>
              <span className="text-lg font-black leading-none">12</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-[#111B5E] truncate">Web Development Workshop</h4>
              <p className="text-xs text-[#5A6482] mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1"><Clock size={12} /> 10:00 AM – 12:00 PM</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> Main Auditorium</span>
              </p>
            </div>
          </div>

          {/* Event 2 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-extrabold uppercase">OCT</span>
              <span className="text-lg font-black leading-none">15</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-[#111B5E] truncate">Career Guidance Session</h4>
              <p className="text-xs text-[#5A6482] mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1"><Clock size={12} /> 03:00 PM – 04:30 PM</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> Online (Zoom)</span>
              </p>
            </div>
          </div>

          {/* Event 3 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] text-[#16A34A] flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-extrabold uppercase">OCT</span>
              <span className="text-lg font-black leading-none">20</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-[#111B5E] truncate">Open Source Meetup</h4>
              <p className="text-xs text-[#5A6482] mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1"><Clock size={12} /> 11:00 AM – 01:00 PM</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> CS Department</span>
              </p>
            </div>
          </div>
        </div>

        {/* Connector: Events → Growth constellation */}
        <PureConnector variant="left-arc" className="mt-8 mb-2 sm:mt-10 sm:mb-2" />
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION: HELP THEM GROW THEIR OWN WAY                 */}
      {/* ======================================================== */}
      <section className="relative pt-4 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <GraduationCap size={26} />
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#111B5E] tracking-tight leading-tight">
          Help them grow their own way
        </h2>
        <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">
          Learn new skills, get career guidance, find collaborators, and explore resources that support your goals.
        </p>

        {/* Feature Constellation Graphic */}
        <div className="mt-12 sm:mt-14 max-w-3xl mx-auto">
          {/* Desktop Composition with Central Illustration */}
          <div className="hidden md:flex flex-col items-center relative">
            {/* Top Bubble: Learn Skills */}
            <div className="mb-6 z-10 vibe-landing-bubble-1">
              <div className="bg-[#FCE7F3]/90 px-6 py-3.5 rounded-2xl border border-[#FBCFE8] flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-white text-[#DB2777] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <GraduationCap size={22} />
                </div>
                <span className="text-base font-bold text-[#111B5E]">Learn Skills</span>
              </div>
            </div>

            {/* Middle Row: Find Mentors | Central Learner | Explore Resources */}
            <div className="flex items-center justify-between w-full max-w-2xl px-2 z-10">
              {/* Left Bubble: Find Mentors */}
              <div className="bg-[#FEF3C7]/90 px-6 py-3.5 rounded-2xl border border-[#FDE68A] flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow vibe-landing-bubble-2">
                <div className="w-11 h-11 rounded-xl bg-white text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Users size={22} />
                </div>
                <span className="text-base font-bold text-[#111B5E]">Find Mentors</span>
              </div>

              {/* Central Learner with Laptop */}
              <div className="relative group mx-4 flex-shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gradient-to-tr from-[#ECFDF5] via-[#E0F2FE] to-[#F5F1FF] p-1">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80"
                    alt="Learner growing with VIBE"
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Right Bubble: Explore Resources */}
              <div className="bg-[#E0F2FE]/90 px-6 py-3.5 rounded-2xl border border-[#BAE6FD] flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow vibe-landing-bubble-3">
                <div className="w-11 h-11 rounded-xl bg-white text-[#0284C7] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <BookOpen size={22} />
                </div>
                <span className="text-base font-bold text-[#111B5E]">Explore Resources</span>
              </div>
            </div>

            {/* Bottom Row: Build Projects & Discover Opportunities */}
            <div className="flex items-center justify-center gap-8 mt-6 z-10">
              {/* Bottom-Left Bubble: Build Projects */}
              <div className="bg-[#EDE9FE]/90 px-6 py-3.5 rounded-2xl border border-[#DDD6FE] flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow vibe-landing-bubble-2">
                <div className="w-11 h-11 rounded-xl bg-white text-[#7C3AED] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Code size={22} />
                </div>
                <span className="text-base font-bold text-[#111B5E]">Build Projects</span>
              </div>

              {/* Bottom-Right Bubble: Discover Opportunities */}
              <div className="bg-[#FEE2E2]/90 px-6 py-3.5 rounded-2xl border border-[#FECACA] flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow vibe-landing-bubble-2">
                <div className="w-11 h-11 rounded-xl bg-white text-[#DC2626] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Briefcase size={22} />
                </div>
                <span className="text-base font-bold text-[#111B5E]">Discover Opportunities</span>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Responsive Stack */}
          <div className="flex md:hidden flex-col items-center space-y-4">
            {/* Central Learner */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-md border-4 border-white bg-gradient-to-tr from-[#ECFDF5] to-[#E0F2FE] p-1 mb-2">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80"
                alt="Learner growing with VIBE"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-md">
              <div className="bg-[#FEF3C7]/90 p-4 rounded-2xl border border-[#FDE68A] flex items-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Users size={20} />
                </div>
                <span className="text-sm font-bold text-[#111B5E]">Find Mentors</span>
              </div>

              <div className="bg-[#FCE7F3]/90 p-4 rounded-2xl border border-[#FBCFE8] flex items-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white text-[#DB2777] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <GraduationCap size={20} />
                </div>
                <span className="text-sm font-bold text-[#111B5E]">Learn Skills</span>
              </div>

              <div className="bg-[#E0F2FE]/90 p-4 rounded-2xl border border-[#BAE6FD] flex items-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white text-[#0284C7] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <BookOpen size={20} />
                </div>
                <span className="text-sm font-bold text-[#111B5E]">Explore Resources</span>
              </div>

              <div className="bg-[#EDE9FE]/90 p-4 rounded-2xl border border-[#DDD6FE] flex items-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white text-[#7C3AED] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Code size={20} />
                </div>
                <span className="text-sm font-bold text-[#111B5E]">Build Projects</span>
              </div>

              <div className="sm:col-span-2 bg-[#FEE2E2]/90 p-4 rounded-2xl border border-[#FECACA] flex items-center justify-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white text-[#DC2626] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Briefcase size={20} />
                </div>
                <span className="text-sm font-bold text-[#111B5E]">Discover Opportunities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connector: Growth constellation → Statistics */}
        <PureConnector variant="center-wave" className="mt-8 mb-2 sm:mt-10 sm:mb-2" />
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION: BE PART OF SOMETHING BIGGER (STATISTICS)     */}
      {/* ======================================================== */}
      <section className="relative pt-4 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Heart size={22} className="fill-current" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
          Be part of something bigger
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#5A6482] max-w-xl mx-auto">
          Join a supportive community that celebrates curiosity, creativity, and continuous learning.
        </p>

        {/* 4 Statistics Cards */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">10K+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Members</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">2K+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Communities</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center flex-shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">5K+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Posts Shared</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">120+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Colleges & Institutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CLOSING CALL TO ACTION BANNER                         */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#F5F1FF] border border-[#E9E1FF] rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-lg text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111B5E] tracking-tight leading-tight">
              Your ideas. Your people. <br />
              A brighter tomorrow.
            </h2>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-lg shadow-[#7540F5]/25 hover:shadow-xl transition-all"
            >
              <span>Join VIBE</span>
              <ArrowRight size={18} />
            </Link>
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

export default Home;
