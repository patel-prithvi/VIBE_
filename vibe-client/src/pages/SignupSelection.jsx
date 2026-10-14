
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  HandUnderline,
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
} from '../components/public/Doodles';

const SignupSelection = () => {
  return (
    <div className="roboto-bold min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-[#F8FAFF] text-[#172554] relative overflow-hidden">
      {/* Soft Ambient Background Shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F3EEFF]/80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full bg-[#F3EEFF]/70 blur-3xl"
      />

      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Decorative Doodles */}
        <div aria-hidden="true" className="hidden sm:block pointer-events-none absolute -top-6 left-10">
          <SparkDoodle color="#FBBF24" size={32} className="-rotate-12" />
        </div>
        <div aria-hidden="true" className="hidden sm:block pointer-events-none absolute top-4 right-12">
          <LoopDoodle color="#EC4899" size={34} />
        </div>
        <div aria-hidden="true" className="hidden md:block pointer-events-none absolute -bottom-10 left-16">
          <SpiralDoodle color="#6D3DF5" size={28} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E2E8F0] text-[#6D3DF5] text-xs font-extrabold uppercase tracking-widest mb-5">
            Join the VIBE Community
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-5 text-[#172554] tracking-tight leading-tight">
            Choose Your{' '}
            <span className="relative inline-block text-[#6D3DF5]">
              Path
              <HandUnderline color="#FBBF24" className="absolute -bottom-2 left-0 w-full" />
            </span>
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Select how you want to participate in the VIBE ecosystem. Each role has specialized tools for your success.
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl w-full mx-auto">
          <SelectionCard
            role="Student"
            badge="For Learners"
            icon={<GraduationCap size={32} />}
            desc="Find tasks, solve problems, and get hired by top verified industries."
            highlights={[
              'Work on real-world projects',
              'Connect with faculty mentors',
              'Build a verified portfolio',
            ]}
            href="/signup/student"
            iconStyle="bg-[#F3EEFF] text-[#6D3DF5]"
          />
          <SelectionCard
            role="Faculty"
            badge="For Educators"
            icon={<Users size={32} />}
            desc="Guide students on real-world projects and build academic-industry bridges."
            highlights={[
              'Mentor student cohorts',
              'Share academic resources',
              'Foster industry collaboration',
            ]}
            href="/signup/faculty"
            iconStyle="bg-[#F3EEFF] text-[#6D3DF5]"
          />
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <p className="text-[#64748B] text-sm sm:text-base">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#6D3DF5] hover:text-[#5B2ED0] font-bold hover:underline underline-offset-4 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SelectionCard = ({ role, badge, icon, desc, highlights = [], href, iconStyle }) => (
  <Link to={href} className="group block h-full focus:outline-none">
    <div className="h-full flex flex-col p-7 sm:p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-[0_8px_30px_rgba(23,37,84,0.04)] hover:border-[#6D3DF5] hover:shadow-[0_16px_40px_rgba(109,61,245,0.10)] group-focus-visible:ring-4 group-focus-visible:ring-[#6D3DF5]/20 transition-all duration-300 relative overflow-hidden">
      {/* Subtle Top Corner Glow on Hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#F3EEFF]/0 group-hover:bg-[#F3EEFF]/80 transition-colors duration-300 blur-2xl"
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xs transition-transform duration-300 group-hover:scale-105 ${iconStyle}`}>
          {icon}
        </div>
        <span className="px-3 py-1 rounded-full bg-[#F8FAFF] border border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:border-[#6D3DF5]/30 group-hover:bg-[#F3EEFF]/60 group-hover:text-[#6D3DF5] transition-colors">
          {badge}
        </span>
      </div>

      <h3 className="text-2xl font-black mb-3 text-[#172554] group-hover:text-[#6D3DF5] transition-colors relative z-10">
        {role}
      </h3>

      <p className="text-[#64748B] text-sm sm:text-base leading-relaxed mb-6 relative z-10">
        {desc}
      </p>

      {highlights.length > 0 && (
        <ul className="space-y-2.5 mb-8 pt-5 border-t border-[#E2E8F0]/80 flex-grow relative z-10">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#172554]">
              <CheckCircle2 size={16} className="text-[#6D3DF5] shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto inline-flex items-center text-sm sm:text-base text-[#6D3DF5] group-hover:text-[#5B2ED0] font-bold relative z-10">
        <span>Start Journey</span>
        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

export default SignupSelection;

