import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Lightbulb,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Heart,
  Plus,
  Minus,
  CheckCircle,
  Gem,
  LayoutGrid,
} from "lucide-react";
import {
  HandUnderline,
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
  WavyConnector,
} from "../components/public/Doodles";

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
    <div className="min-h-screen bg-white text-[#111B5E] pt-24 overflow-hidden selection:bg-[#7540F5] selection:text-white">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (TWO-COLUMN)                            */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 rounded-full bg-[#F5F1FF] text-[#7540F5] text-xs font-black uppercase tracking-widest"
            >
              FEATURES
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111B5E] leading-[1.15]"
            >
              Everything you need to{" "}
              <span className="relative inline-block text-[#7540F5]">
                Learn, Connect and Grow
                <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#5A6482] font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Discover powerful features designed for students and faculty to share knowledge, collaborate on projects, and unlock new opportunities — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 flex justify-center lg:justify-start"
            >
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-lg shadow-[#7540F5]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group"
              >
                <span>Join VIBE</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
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

        <WavyConnector className="my-10" />
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION: OUR FEATURES (6 GRID CARDS)                  */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
          Our Features
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#5A6482] max-w-xl mx-auto">
          Explore everything VIBE offers to help you build meaningful connections and create new opportunities.
        </p>

        {/* 6 Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
          {/* Card 1: Communities */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group">
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group">
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group">
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group">
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group">
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group">
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

        <WavyConnector className="my-10" />
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION: WHY CHOOSE VIBE?                             */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
          Why Choose VIBE?
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#5A6482] max-w-xl mx-auto">
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
      </section>

      {/* ======================================================== */}
      {/* 4. STATISTICS STRIP                                      */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">10K+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Members</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">2K+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Communities</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#111B5E]">5K+</p>
              <p className="text-xs text-[#5A6482] font-semibold">Posts Shared</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-3">
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
      {/* 5. FAQ SECTION (ACCORDION)                               */}
      {/* ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B5E] tracking-tight">
            Frequently{" "}
            <span className="relative inline-block text-[#7540F5]">
              Asked
              <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full" />
            </span>{" "}
            Questions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#5A6482]">Got questions? We've got answers.</p>
        </div>

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
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#F5F1FF] border border-[#E9E1FF] rounded-3xl p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-[#7540F5] uppercase block">
              READY TO GET STARTED?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111B5E] tracking-tight">
              Join VIBE and be part of a supportive community that believes in your potential.
            </h2>
          </div>
          <Link
            to="/signup"
            className="flex-shrink-0 px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-lg shadow-[#7540F5]/25 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>Join VIBE</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;
