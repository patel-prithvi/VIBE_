
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  GraduationCap,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Building,
  BookOpen,
  Lock,
  Briefcase,
  MapPin,
  Globe,
  Award,
  Users,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  Plus,
  X,
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
import api from '../services/api';
import { useToast } from '../components/Toast';

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const totalSteps = 4;

  // Determine role from path
  const role = location.pathname.split('/').pop() || 'student';

  // Reset step and errors if user switches role route
  useEffect(() => {
    setStep(1);
    setErrors({});
  }, [role]);

  const [formData, setFormData] = useState({
    // Shared / Student
    fullName: '',
    dob: '',
    mobile: '',
    email: '',
    collegeName: '',
    degree: '',
    branch: '',
    currentYear: '',
    password: '',
    confirmPassword: '',
    // Faculty Specific
    position: '',
    experience: '',
    expertise: '',
    skills: [],
    // Industry Specific
    companyName: '',
    industryType: '',
    establishmentYear: '',
    location: '',
    internshipType: 'Remote',
    website: '',
    otp: ''
  });

  const [skillInputValue, setSkillInputValue] = useState('');

  const handleAddFacultySkill = (skillToAdd) => {
    const skill = (skillToAdd || skillInputValue).trim();
    if (!skill) return;
    const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
    if (currentSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      toast.error(`"${skill}" is already added.`);
      return;
    }
    updateFormData({ skills: [...currentSkills, skill] });
    setSkillInputValue('');
  };

  const handleRemoveFacultySkill = (skillToRemove) => {
    const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
    updateFormData({ skills: currentSkills.filter(s => s !== skillToRemove) });
  };

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
    // Clear errors for updated fields
    const fieldKeys = Object.keys(fields);
    setErrors(prev => {
      const newErrors = { ...prev };
      fieldKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (role === 'industry') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.industryType.trim()) newErrors.industryType = 'Industry type is required';
    } else {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!isValidMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (role === 'student') {
      if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
      if (!formData.degree) newErrors.degree = 'Degree is required';
      if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
      if (!formData.currentYear) newErrors.currentYear = 'Current year is required';
    } else if (role === 'faculty') {
      if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
      if (!formData.position.trim()) newErrors.position = 'Position is required';
      if (!formData.experience) newErrors.experience = 'Experience is required';
      if (!formData.expertise.trim()) newErrors.expertise = 'Expertise is required';
      if (!formData.skills || formData.skills.length === 0) newErrors.skills = 'Please add at least one skill';
      if (formData.skills && formData.skills.length > 0 && newErrors.skills) delete newErrors.skills;
    } else if (role === 'industry') {
      if (!formData.establishmentYear) newErrors.establishmentYear = 'Establishment year is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.internshipType) newErrors.internshipType = 'Internship type is required';
      if (formData.website && formData.website.trim() && !isValidUrl(formData.website)) {
        newErrors.website = 'Please enter a valid URL starting with http:// or https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = false;

    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    }

    if (isValid) {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 1));
  };

  // Role-specific validation
  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Mobile validation (basic)
  const isValidMobile = (mobile) => {
    const mobileRegex = /^[0-9+\s-]{10,}$/;
    return mobileRegex.test(mobile);
  };

  // URL validation (optional website with http:// or https://)
  const isValidUrl = (url) => {
    if (!url || !url.trim()) return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isStep1Valid = (() => {
    if (role === 'industry') {
      return formData.companyName.trim() &&
        formData.industryType.trim() &&
        isValidEmail(formData.email) &&
        isValidMobile(formData.mobile);
    }
    return formData.fullName.trim() &&
      formData.dob &&
      isValidMobile(formData.mobile) &&
      isValidEmail(formData.email);
  })();

  const isStep2Valid = (() => {
    if (role === 'student') {
      return formData.collegeName.trim() &&
        formData.degree &&
        formData.branch.trim() &&
        formData.currentYear;
    }
    if (role === 'faculty') {
      return formData.collegeName.trim() &&
        formData.position.trim() &&
        formData.experience &&
        formData.expertise.trim() &&
        Array.isArray(formData.skills) &&
        formData.skills.length > 0;
    }
    if (role === 'industry') {
      const hasRequired = formData.establishmentYear &&
        formData.location.trim() &&
        formData.internshipType;
      const isWebsiteOk = !formData.website || !formData.website.trim() || isValidUrl(formData.website);
      return Boolean(hasRequired && isWebsiteOk);
    }
    return false;
  })();

  const isStep3Valid = formData.password &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8;

  // Define role specific content configurations separately to avoid temporal dead zone usage
  const ROLE_CONFIGS = {
    student: {
      title: "Student Account",
      subtitle: "Join VIBE to start solving real world challenges",
      badge: "Student Registration",
      heroTitlePrefix: "Start your journey with",
      heroDesc: "Connect with faculty mentors, collaborate with peers, and build real-world experience through verified projects.",
      icon: <GraduationCap size={26} className="text-[#6D3DF5]" />,
      step2Title: "Academic Details",
      step2Icon: <GraduationCap size={20} className="text-[#6D3DF5]" />,
      stepLabels: ["Personal", "Academic", "Security", "Verify"],
      pillars: [
        {
          icon: <BookOpen size={18} className="text-[#6D3DF5]" />,
          title: "Verified Academic & Industry Tasks",
          desc: "Apply your classroom knowledge to practical problem statements."
        },
        {
          icon: <Users size={18} className="text-[#6D3DF5]" />,
          title: "Direct Faculty Mentorship",
          desc: "Receive guidance, feedback, and support from professors."
        },
        {
          icon: <MessageSquare size={18} className="text-[#6D3DF5]" />,
          title: "Collaborative Campus Community",
          desc: "Share resources, join discussions, and grow with peers."
        }
      ]
    },
    faculty: {
      title: "Faculty Account",
      subtitle: "Mentor real industry problems and guide professionals",
      badge: "Faculty Registration",
      heroTitlePrefix: "Inspire and mentor on",
      heroDesc: "Guide students on real-world projects, share academic resources, and build stronger academic-industry bridges.",
      icon: <User size={26} className="text-[#6D3DF5]" />,
      step2Title: "Professional Profile",
      step2Icon: <Award size={20} className="text-[#6D3DF5]" />,
      stepLabels: ["Personal", "Profile", "Security", "Verify"],
      pillars: [
        {
          icon: <GraduationCap size={18} className="text-[#6D3DF5]" />,
          title: "Dedicated Mentorship Hub",
          desc: "Review student requests, guide projects, and track progress."
        },
        {
          icon: <BookOpen size={18} className="text-[#6D3DF5]" />,
          title: "Academic Feed & Resources",
          desc: "Publish insights, course materials, and departmental updates."
        },
        {
          icon: <Award size={18} className="text-[#6D3DF5]" />,
          title: "Academic–Industry Collaboration",
          desc: "Connect your institution with verified industry initiatives."
        }
      ]
    },
    industry: {
      title: "Industry Account",
      subtitle: "Hire skilled interns by evaluating real work",
      badge: "Industry Partner Registration",
      heroTitlePrefix: "Discover verified talent on",
      heroDesc: "Post real-world tasks, evaluate student capabilities objectively, and hire verified talent with confidence.",
      icon: <Briefcase size={26} className="text-[#6D3DF5]" />,
      step2Title: "Company Details",
      step2Icon: <Building size={20} className="text-[#6D3DF5]" />,
      stepLabels: ["Company", "Details", "Security", "Verify"],
      pillars: [
        {
          icon: <Briefcase size={18} className="text-[#6D3DF5]" />,
          title: "Work-Based Talent Evaluation",
          desc: "Assess candidates through real project submissions and tasks."
        },
        {
          icon: <ShieldCheck size={18} className="text-[#6D3DF5]" />,
          title: "Faculty-Backed Candidates",
          desc: "Connect with motivated students supported by academic mentors."
        },
        {
          icon: <Building size={18} className="text-[#6D3DF5]" />,
          title: "Flexible Internship Pipeline",
          desc: "Manage remote, onsite, or hybrid internship roles seamlessly."
        }
      ]
    }
  };

  // Select the appropriate config based on current role, defaulting to student
  const roleContent = ROLE_CONFIGS[role] || ROLE_CONFIGS.student;

  const handleResendOtp = async () => {
    const userData = {
      email: formData.email,
      role: role,
      accountType: role,
      name: role === 'industry' ? formData.companyName : formData.fullName,
      mobileNo: formData.mobile,
      dob: formData.dob,
      password: formData.password,
      
      // Student/Faculty specific
      institutionName: formData.collegeName,
      degree: formData.degree,
      branch: formData.branch,
      currentYear: formData.currentYear,
      
      position: formData.position,
      experience: formData.experience,
      expertise: formData.expertise,
      skills: formData.skills || [],
      
      // Industry specific
      companyName: formData.companyName,
      industryType: formData.industryType,
      establishmentYear: formData.establishmentYear,
      location: formData.location,
      internshipType: formData.internshipType,
      website: formData.website ? formData.website.trim() : ""
    };

    setIsLoading(true);
    try {
      await api.post('/users/register', userData);
      toast.success("Verification code resent successfully!");
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="roboto-bold min-h-screen pt-20 sm:pt-24 pb-16 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#F8FAFF] text-[#172554] relative overflow-hidden flex items-center">
      {/* Soft Ambient Lavender Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F3EEFF]/80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-[#F3EEFF]/70 blur-3xl"
      />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-10 xl:gap-14 items-start">

          {/* ======================================================== */}
          {/* LEFT SIDE: VIBE Brand & Role Context Panel               */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-28"
          >
            {/* Role Switcher / Back to Selection Bar */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1.5 p-1.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs mb-3 sm:mb-6">
              {[
                { id: 'student', label: 'Student', path: '/signup/student', icon: <GraduationCap size={14} /> },
                { id: 'faculty', label: 'Faculty', path: '/signup/faculty', icon: <User size={14} /> },
              ].map((tab) => {
                const active = role === tab.id;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                      active
                        ? 'bg-[#6D3DF5] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#172554] hover:bg-[#F8FAFF]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Role Hero Headline */}
            <div className="relative max-w-lg">
              <div aria-hidden="true" className="hidden sm:block pointer-events-none absolute -top-5 -left-6">
                <SparkDoodle color="#FBBF24" size={30} className="-rotate-12" />
              </div>
              <div aria-hidden="true" className="hidden sm:block pointer-events-none absolute top-6 -right-6">
                <LoopDoodle color="#EC4899" size={30} />
              </div>

              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3EEFF] text-[#6D3DF5] text-xs font-bold uppercase tracking-wider mb-0 sm:mb-3">
                {roleContent.badge}
              </span>

              <h2 className="hidden sm:block text-3xl sm:text-4xl xl:text-[44px] font-black text-[#172554] leading-[1.15] tracking-tight">
                {roleContent.heroTitlePrefix}{' '}
                <span className="relative inline-block text-[#6D3DF5] mt-0.5">
                  VIBE
                  <HandUnderline
                    color="#FBBF24"
                    className="absolute -bottom-2 left-0 w-full"
                  />
                </span>
              </h2>

              <p className="hidden sm:block mt-5 text-sm sm:text-base text-[#64748B] leading-relaxed">
                {roleContent.heroDesc}
              </p>
            </div>

            {/* Role Value Pillars (Visible on Desktop/Tablet, Compact on Mobile) */}
            <div className="hidden sm:flex flex-col gap-3.5 mt-8 w-full max-w-lg">
              {roleContent.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_16px_rgba(23,37,84,0.03)] text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] flex items-center justify-center shrink-0 mt-0.5">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172554]">{pillar.title}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Tagline Banner on Desktop */}
            <div className="hidden lg:flex items-center justify-between w-full max-w-lg mt-8 pt-6 border-t border-[#E2E8F0]">
              <div>
                <p className="text-sm font-extrabold text-[#172554]">
                  Ideas. People. Opportunities.
                </p>
                <p className="text-xs font-bold text-[#6D3DF5]">
                  All in one academic ecosystem.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StarDoodle color="#FBBF24" size={20} />
                <SpiralDoodle color="#6D3DF5" size={24} />
              </div>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* RIGHT SIDE: 4-Step Signup Form Card                      */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 w-full max-w-2xl mx-auto relative">
            {/* Decorative Corner Doodle */}
            <div
              aria-hidden="true"
              className="hidden sm:block pointer-events-none absolute -top-6 -right-4 z-20"
            >
              <LoopDoodle color="#6D3DF5" size={34} />
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(23,37,84,0.04)] relative z-10">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                    {roleContent.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#172554] tracking-tight">
                      {roleContent.title}
                    </h1>
                    <p className="text-sm text-[#64748B] mt-0.5">
                      {roleContent.subtitle}
                    </p>
                  </div>
                </div>
                <div className="self-start sm:self-center inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#F3EEFF] text-[#6D3DF5] text-xs font-extrabold tracking-wide shrink-0">
                  Step {step} of {totalSteps}
                </div>
              </div>

              {/* Stepper Progress Indicator */}
              <div className="mb-9 px-2 sm:px-4">
                <div className="relative flex justify-between items-center">
                  {/* Background Track */}
                  <div className="absolute top-5 left-0 w-full h-1 bg-[#E2E8F0] -translate-y-1/2 rounded-full" />
                  {/* Active Fill Track */}
                  <div
                    className="absolute top-5 left-0 h-1 bg-[#6D3DF5] -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                  />

                  {[1, 2, 3, 4].map((s) => {
                    const isCompleted = s < step;
                    const isCurrent = s === step;
                    const label = roleContent.stepLabels?.[s - 1] || `Step ${s}`;
                    return (
                      <div key={s} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                            isCompleted
                              ? 'bg-[#6D3DF5] text-white shadow-sm shadow-[#6D3DF5]/20'
                              : isCurrent
                              ? 'bg-[#6D3DF5] text-white ring-4 ring-[#F3EEFF] shadow-md shadow-[#6D3DF5]/25 scale-105'
                              : 'bg-white text-[#64748B] border-2 border-[#E2E8F0]'
                          }`}
                        >
                          {isCompleted ? <Check size={18} strokeWidth={2.5} /> : s}
                        </div>
                        <span
                          className={`mt-2 text-[11px] font-bold uppercase tracking-wider ${
                            s <= step ? 'text-[#172554]' : 'text-[#64748B]'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Forms */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${role}-${step}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] flex items-center justify-center text-[#6D3DF5]">
                          {role === 'industry' ? <Building size={18} /> : <User size={18} />}
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#172554]">
                          {role === 'industry' ? 'Company Info' : 'Personal Info'}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {role === 'industry' ? (
                          <>
                            <InputField
                              label="Company Name"
                              icon={<Building size={18} />}
                              placeholder="Acme Corp"
                              value={formData.companyName}
                              onChange={v => updateFormData({ companyName: v })}
                              error={errors.companyName}
                            />
                            <InputField
                              label="Industry Type"
                              icon={<Briefcase size={18} />}
                              placeholder="Software, Finance, Healthcare..."
                              value={formData.industryType}
                              onChange={v => updateFormData({ industryType: v })}
                              error={errors.industryType}
                            />
                          </>
                        ) : (
                          <>
                            <InputField
                              label="Full Name"
                              icon={<User size={18} />}
                              placeholder="John Doe"
                              value={formData.fullName}
                              onChange={v => updateFormData({ fullName: v })}
                              error={errors.fullName}
                            />
                            <InputField
                              label="Date of Birth"
                              icon={<Calendar size={18} />}
                              type="date"
                              value={formData.dob}
                              onChange={v => updateFormData({ dob: v })}
                              error={errors.dob}
                            />
                          </>
                        )}
                        <InputField
                          label="Mobile Number"
                          icon={<Phone size={18} />}
                          placeholder="+91 98765 43210"
                          value={formData.mobile}
                          onChange={v => updateFormData({ mobile: v })}
                          error={errors.mobile}
                        />
                        <InputField
                          label="Official Email"
                          icon={<Mail size={18} />}
                          placeholder={role === 'industry' ? "hr@company.com" : "name@college.edu"}
                          value={formData.email}
                          onChange={v => updateFormData({ email: v })}
                          error={errors.email}
                          name="email"
                          autoComplete="username"
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          fullWidth
                          size="lg"
                          disabled={!isStep1Valid}
                          onClick={nextStep}
                          className="h-13 text-base !rounded-full !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !shadow-md !shadow-[#6D3DF5]/20 focus:!ring-[#6D3DF5]"
                        >
                          Next Step <ArrowRight className="ml-2" size={18} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] flex items-center justify-center text-[#6D3DF5]">
                          {roleContent.step2Icon}
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#172554]">
                          {roleContent.step2Title}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {role === 'student' && (
                          <>
                            <InputField
                              label="College Name"
                              icon={<Building size={18} />}
                              placeholder="Institute of Technology"
                              value={formData.collegeName}
                              onChange={v => updateFormData({ collegeName: v })}
                              error={errors.collegeName}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <SelectField
                                label="Degree"
                                value={formData.degree}
                                options={['B.Tech', 'BCA', 'B.Sc', 'MCA', 'MBA']}
                                onChange={v => updateFormData({ degree: v })}
                                error={errors.degree}
                              />
                              <InputField
                                label="Branch"
                                icon={<BookOpen size={18} />}
                                placeholder="Computer Science"
                                value={formData.branch}
                                onChange={v => updateFormData({ branch: v })}
                                error={errors.branch}
                              />
                            </div>
                            <SelectField
                              label="Current Year"
                              value={formData.currentYear}
                              options={['1st Year', '2nd Year', '3rd Year', '4th Year']}
                              onChange={v => updateFormData({ currentYear: v })}
                              error={errors.currentYear}
                            />
                          </>
                        )}
                        {role === 'faculty' && (
                          <>
                            <InputField
                              label="College Name"
                              icon={<Building size={18} />}
                              placeholder="Institute of Technology"
                              value={formData.collegeName}
                              onChange={v => updateFormData({ collegeName: v })}
                              error={errors.collegeName}
                            />
                            <InputField
                              label="Position / Designation"
                              icon={<User size={18} />}
                              placeholder="Assistant Professor"
                              value={formData.position}
                              onChange={v => updateFormData({ position: v })}
                              error={errors.position}
                            />
                            <InputField
                              label="Years of Experience"
                              icon={<Calendar size={18} />}
                              type="number"
                              placeholder="5"
                              value={formData.experience}
                              onChange={v => updateFormData({ experience: v })}
                              error={errors.experience}
                            />
                            <InputField
                              label="Expertise Domains"
                              icon={<Award size={18} />}
                              placeholder="Machine Learning, IoT, Web Dev"
                              value={formData.expertise}
                              onChange={v => updateFormData({ expertise: v })}
                              error={errors.expertise}
                            />
                          </>
                        )}
                        {role === 'industry' && (
                          <>
                            <InputField
                              label="Years Since Establishment"
                              icon={<Calendar size={18} />}
                              type="number"
                              placeholder="2010"
                              value={formData.establishmentYear}
                              onChange={v => updateFormData({ establishmentYear: v })}
                              error={errors.establishmentYear}
                            />
                            <InputField
                              label="Location"
                              icon={<MapPin size={18} />}
                              placeholder="Mumbai, Remote, New York"
                              value={formData.location}
                              onChange={v => updateFormData({ location: v })}
                              error={errors.location}
                            />
                            <SelectField
                              label="Internship Type"
                              value={formData.internshipType}
                              options={['Remote', 'Onsite', 'Hybrid']}
                              onChange={v => updateFormData({ internshipType: v })}
                              error={errors.internshipType}
                            />
                            <InputField
                              label="Company Website (Optional)"
                              icon={<Globe size={18} />}
                              type="url"
                              placeholder="https://www.example.com"
                              value={formData.website}
                              onChange={v => updateFormData({ website: v })}
                              error={errors.website}
                            />
                            <p className="text-xs text-[#64748B] italic mt-1 ml-1">
                              “All companies are verified before posting internships.”
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:space-x-4 pt-2">
                        <Button
                          variant="secondary"
                          className="sm:flex-1 h-13 !rounded-full !bg-[#F8FAFF] !text-[#172554] !border !border-[#E2E8F0] hover:!bg-[#F3EEFF]/60 hover:!border-[#6D3DF5]/30 focus:!ring-[#6D3DF5]"
                          onClick={prevStep}
                        >
                          <ArrowLeft className="mr-2" size={18} /> Back
                        </Button>
                        <Button
                          className="sm:flex-[2] h-13 text-base !rounded-full !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !shadow-md !shadow-[#6D3DF5]/20 focus:!ring-[#6D3DF5]"
                          size="lg"
                          disabled={!isStep2Valid}
                          onClick={nextStep}
                        >
                          Next Step <ArrowRight className="ml-2" size={18} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] flex items-center justify-center text-[#6D3DF5]">
                          <ShieldCheck size={18} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#172554]">
                          Security
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <InputField
                          label="Create Password"
                          icon={<Lock size={18} />}
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={v => updateFormData({ password: v })}
                          error={errors.password}
                          name="password"
                          autoComplete="new-password"
                        />
                        <InputField
                          label="Confirm Password"
                          icon={<Lock size={18} />}
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={v => updateFormData({ confirmPassword: v })}
                          error={errors.confirmPassword}
                          name="confirmPassword"
                          autoComplete="new-password"
                        />
                        <div className="p-4 bg-[#F8FAFF] rounded-2xl border border-[#E2E8F0] text-sm text-[#64748B] space-y-1.5">
                          <p className="flex items-center gap-2">
                            <CheckCircle2
                              size={15}
                              className={formData.password.length >= 8 ? 'text-[#6D3DF5]' : 'text-[#94A3B8]'}
                            />
                            <span>• At least 8 characters long</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <CheckCircle2
                              size={15}
                              className={
                                formData.password && formData.password === formData.confirmPassword
                                  ? 'text-[#6D3DF5]'
                                  : 'text-[#94A3B8]'
                              }
                            />
                            <span>• Must match both fields</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:space-x-4 pt-2">
                        <Button
                          variant="secondary"
                          className="sm:flex-1 h-13 !rounded-full !bg-[#F8FAFF] !text-[#172554] !border !border-[#E2E8F0] hover:!bg-[#F3EEFF]/60 hover:!border-[#6D3DF5]/30 focus:!ring-[#6D3DF5]"
                          onClick={prevStep}
                        >
                          <ArrowLeft className="mr-2" size={18} /> Back
                        </Button>
                        <Button
                          className="sm:flex-[2] h-13 text-base !rounded-full !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !shadow-md !shadow-[#6D3DF5]/20 focus:!ring-[#6D3DF5]"
                          size="lg"
                          disabled={!isStep3Valid || isLoading}
                          onClick={async () => {
                            if (!validateStep3()) {
                              return;
                            }

                            // Collect all data for registration
                            const userData = {
                              email: formData.email,
                              role: role,
                              accountType: role,
                              name: role === 'industry' ? formData.companyName : formData.fullName,
                              mobileNo: formData.mobile,
                              dob: formData.dob,
                              password: formData.password,

                              // Student/Faculty specific
                              institutionName: formData.collegeName,
                              degree: formData.degree,
                              branch: formData.branch,
                              currentYear: formData.currentYear,

                              position: formData.position,
                              experience: formData.experience,
                              expertise: formData.expertise,
                              skills: formData.skills || [],

                              // Industry specific
                              companyName: formData.companyName,
                              industryType: formData.industryType,
                              establishmentYear: formData.establishmentYear,
                              location: formData.location,
                              internshipType: formData.internshipType,
                              website: formData.website ? formData.website.trim() : ""
                            };

                            setIsLoading(true);
                            try {
                              // Step 3 now sends ALL data to initiate registration
                              await api.post('/users/register', userData);
                              nextStep();
                            } catch (error) {
                              if (error.response && error.response.status === 409) {
                                toast.error("User with this email already exists.");
                              } else {
                                console.error("Send OTP error:", error);
                              }

                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            "Send Verification Code"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] flex items-center justify-center text-[#6D3DF5]">
                          <ShieldCheck size={18} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#172554]">
                          Verify Email
                        </h2>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F3EEFF]/60 border border-[#E2E8F0] text-sm text-[#172554]">
                        We sent a verification code to <b>{formData.email}</b>. Please enter it below.
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <InputField
                          label="Verification Code"
                          icon={<ShieldCheck size={18} />}
                          placeholder="123456"
                          value={formData.otp}
                          onChange={v => {
                            if (/^\d*$/.test(v) && v.length <= 6) updateFormData({ otp: v });
                          }}
                          maxLength={6}
                          inputMode="numeric"
                        />
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-sm text-[#6D3DF5] hover:text-[#5B2ED0] font-bold transition-colors"
                          >
                            Resend Code?
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:space-x-4 pt-2">
                        <Button
                          variant="secondary"
                          className="sm:flex-1 h-13 !rounded-full !bg-[#F8FAFF] !text-[#172554] !border !border-[#E2E8F0] hover:!bg-[#F3EEFF]/60 hover:!border-[#6D3DF5]/30 focus:!ring-[#6D3DF5]"
                          onClick={prevStep}
                        >
                          <ArrowLeft className="mr-2" size={18} /> Back
                        </Button>
                        <Button
                          className="sm:flex-[2] h-13 text-base !rounded-full !bg-[#6D3DF5] hover:!bg-[#5B2ED0] !text-white !shadow-md !shadow-[#6D3DF5]/20 focus:!ring-[#6D3DF5]"
                          size="lg"
                          disabled={(!formData.otp || formData.otp.length < 6) || isLoading}
                          onClick={async () => {
                            // Final step just verifies OTP
                            setIsLoading(true);
                            try {
                              await auth.signup({
                                email: formData.email,
                                otp: formData.otp
                              });

                              if (role === 'industry') {
                                toast.success('Application Submitted! Your company registration has been submitted for verification. Please login to continue.');
                                navigate('/login');
                              } else {
                                // Show success message
                                const successMessage = role === 'student'
                                  ? 'Welcome to VIBE! Your student account has been created successfully. Please login to access your dashboard.'
                                  : 'Welcome to VIBE! Your faculty account has been created successfully. Please login to access your dashboard.';

                                toast.success(successMessage);

                                // Redirect to login for all users
                                navigate('/login');
                              }
                            } catch (error) {
                              toast.error('Error creating account. Please check the OTP and try again.');
                              console.error('Signup error:', error);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </span>
                          ) : (
                            role === 'industry' ? 'Submit for Verification' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Card Footer */}
              <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#64748B]">
                <p>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-[#6D3DF5] hover:text-[#5B2ED0] font-bold hover:underline underline-offset-4"
                  >
                    Log In
                  </Link>
                </p>
                <Link
                  to="/signup"
                  className="text-xs font-semibold text-[#64748B] hover:text-[#6D3DF5] transition-colors"
                >
                  ← View all account roles
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Internal Helper Components for Inputs
const InputField = ({
  label,
  icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  ...props
}) => (
  <div className="relative group">
    <label className="vibe-auth-label group-focus-within:text-[#6D3DF5]">
      {label}
    </label>
    <div className="relative">
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
          error ? 'text-red-500' : 'text-[#64748B] group-focus-within:text-[#6D3DF5]'
        }`}
      >
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-[#F8FAFF] border rounded-2xl py-3.5 pl-12 pr-4 text-[#172554] placeholder-[#94A3B8] focus:outline-none focus:bg-white transition-all font-medium ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-[#E2E8F0] focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10'
        }`}
        placeholder={placeholder}
        {...props}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-500 mt-1.5 ml-1 font-medium"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
  error
}) => (
  <div className="relative group">
    <label className="vibe-auth-label group-focus-within:text-[#6D3DF5]">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-[#F8FAFF] border rounded-2xl py-3.5 pl-4 pr-10 text-[#172554] focus:outline-none focus:bg-white transition-all appearance-none font-medium ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-[#E2E8F0] focus:border-[#6D3DF5] focus:ring-4 focus:ring-[#6D3DF5]/10'
        }`}
      >
        <option value="" disabled className="bg-white text-[#94A3B8]">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt} className="bg-white text-[#172554]">{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] group-focus-within:text-[#6D3DF5] transition-colors">
        <ChevronDown size={18} />
      </div>
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-500 mt-1.5 ml-1 font-medium"
      >
        {error}
      </motion.p>
    )}
  </div>
);

export default Signup;

