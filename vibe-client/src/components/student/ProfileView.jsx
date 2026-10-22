import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../utils/auth';
import api from '../../services/api';
import Avatar from '../shared/Avatar';
import { useToast } from '../Toast';
import {
  User,
  GraduationCap,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Briefcase,
  Building,
  Calendar,
  Users,
  ArrowRight,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Save,
} from "lucide-react";

export const ProfileView = ({ user, onProfileUpdate }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [internships, setInternships] = useState([]);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = false;
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobileNo: user?.mobileNo || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
    institutionName: user?.Profile?.InstituteName || "",
    degree: user?.Profile?.degree || "B.Tech",
    branch: user?.Profile?.branch || user?.Profile?.Branch || "",
    currentYear: user?.Profile?.yearOfStudy || user?.Profile?.YearOfStudy || "1st Year",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await auth.updateProfile(user._id || user.id, formData);
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (isEditing) {
      handleUpdateProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    try {
      setPwLoading(true);
      await api.post('/users/change-password', { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/submissions/me");
        const items = (res.data?.data || []).map((s) => {
          const st = String(s.status || "").toLowerCase();
          return {
            id: String(s._id),
            company:
              s.taskId?.createdBy?.Profile?.InstituteName ||
              s.taskId?.createdBy?.name ||
              s.taskId?.companyName ||
              "VIBE Partner",
            role: s.taskId?.roleOffered || s.taskId?.title || "Intern",
            appliedDate: new Date(s.createdAt).toLocaleDateString(),
            status: st || "submitted",
          };
        });
        if (mounted) setInternships(items);
      } catch (e) {
        if (mounted) setInternships([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const inputClasses =
    "w-full px-3.5 py-2.5 rounded-xl border border-[#E1E8F2] bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#172554] placeholder-[#94A3B8] text-sm font-medium hover:border-[#CBD5E1]";

  const filledFields = [
    formData.name,
    formData.mobileNo,
    formData.dob,
    formData.institutionName,
    formData.degree,
    formData.branch,
    formData.currentYear,
  ].filter((v) => v && String(v).trim()).length;
  const completion = Math.round((filledFields / 7) * 100);

  const normStatus = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'hired' || v === 'offer' || v === 'approved' || v === 'selected') return 'SELECTED';
    if (v === 'rejected') return 'REJECTED';
    return 'ACTIVE';
  };
  const selectedCount = internships.filter((i) => normStatus(i.status) === 'SELECTED').length;
  const activeCount = internships.filter((i) => normStatus(i.status) === 'ACTIVE').length;

  return (
    /* Centered content container with a sensible max width (~1150px) */
    <div className="max-w-[1150px] mx-auto w-full space-y-6 pb-12">
      {/* 1. Profile Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          {/* Avatar Container with Purple Theme */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#6D3DF5] p-0.5 shadow-sm">
              <Avatar
                name={user.name}
                src={user.avatar}
                variant="purple"
                className="w-full h-full rounded-[14px]"
                initialsClassName="text-xl md:text-2xl text-white font-bold"
              />
            </div>
          </div>

          {/* Details & Info */}
          <div className="text-center md:text-left space-y-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl md:text-2xl font-bold text-[#172554] tracking-tight">
                {user.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6D3DF5] text-[10px] font-bold uppercase tracking-wider border border-[#E9E1FF]">
                {user.role || "Student"}
              </span>
            </div>
            <p className="text-[#64748B] font-medium text-xs md:text-sm">
              {formData.degree} Student • {formData.branch || "General"}
            </p>

            {/* Profile Completion Bar */}
            <div className="pt-2 w-full max-w-xs mx-auto md:mx-0">
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-xs font-semibold text-[#64748B]">
                  Profile Completion
                </span>
                <span className="text-xs font-bold text-[#6D3DF5]">
                  {completion}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#F2ECFF] rounded-full overflow-hidden p-0.5 border border-[#E9E1FF]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#6D3DF5] rounded-full"
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap size={15} className="text-[#6D3DF5]" />
              <span>
                {formData.branch || "Computer Science"} • {formData.currentYear}
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 pt-1 text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5 font-medium">
                <Building size={14} className="text-[#94A3B8] shrink-0" />
                <span>{formData.institutionName || "VIBE Academic Community"}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] text-[10px] font-bold uppercase tracking-wider">
                  <Briefcase size={11} />
                  <span>{internships.length} Applications</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={11} />
                  <span>{activeCount} Active</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-[10px] font-bold uppercase tracking-wider">
                  <Users size={11} />
                  <span>{selectedCount} Paid</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        </motion.section>

      {/* 2. Stepper Form Section */}
      <section className="space-y-4">
        {/* Stepper Header */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              step === 1
                ? "bg-[#6D3DF5] text-white shadow-xs"
                : "bg-white text-[#64748B] border border-[#E1E8F2]"
            } transition-colors flex-shrink-0`}
          >
            <User size={18} />
          </div>
          <div className="h-px w-4 md:w-6 bg-[#CBD5E1]" />
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              step === 2
                ? "bg-[#6D3DF5] text-white shadow-xs"
                : "bg-white text-[#64748B] border border-[#E1E8F2]"
            } transition-colors flex-shrink-0`}
          >
            <GraduationCap size={18} />
          </div>
          <h3 className="text-lg font-bold text-[#172554] ml-1.5">
            {step === 1 ? "Personal Information" : "Academic Information"}
          </h3>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className={inputClasses + " opacity-60 cursor-not-allowed bg-[#F8FAFC]"}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#6D3DF5] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:bg-[#5B2FD6] transition-all group"
                  >
                    Next Step{" "}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    College Name
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter college name"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Degree
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                  >
                    <option>B.Tech</option>
                    <option>BCA</option>
                    <option>B.Sc</option>
                    <option>MCA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Branch / Specialization
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g. Computer Science"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Current Year
                  </label>
                  <select
                    name="currentYear"
                    value={formData.currentYear}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col md:flex-row justify-between gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-1.5 text-[#64748B] text-sm font-bold px-3 py-2 hover:text-[#6D3DF5] transition-colors"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Internship Tracker */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center flex-shrink-0">
              <Briefcase size={18} />
            </div>
            <h3 className="text-lg font-bold text-[#172554]">Internship Tracker</h3>
          </div>
        </div>

        <div className="grid gap-4">
          {internships.length > 0 ? (
            internships.map((intern, i) => (
              <motion.div
                key={intern.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all group overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-4 min-w-fit md:min-w-[200px]">
                    <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E1E8F2] flex items-center justify-center font-bold text-lg text-[#64748B] shrink-0">
                      {intern.company[0]}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#172554]">{intern.company}</h4>
                      <p className="text-[#6D3DF5] font-bold text-xs">{intern.role}</p>
                      <div className="flex items-center gap-1.5 text-[#94A3B8] text-[11px] font-semibold mt-1 uppercase tracking-wider">
                        <Calendar size={12} /> {intern.appliedDate}
                      </div>
                      {(() => {
                        const badge = normBadge(intern.status);
                        return (
                          <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeCls(badge)}`}>
                            {badge.replace('_',' ')}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="hidden sm:flex items-center justify-between w-full overflow-x-auto py-2 no-scrollbar">
                      {(() => {
                        const st = normBadge(intern.status);
                        const shortlistedActive = st !== 'APPLIED';
                        const shortlistedComplete = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedActive = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedComplete = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewActive = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewComplete = st === 'SELECTED';
                        const resultActive = ['SELECTED','REJECTED'].includes(st);
                        return (
                          <>
                            <TrackerStep label="Applied" active complete orientation="horizontal" />
                            <TrackerLine active orientation="horizontal" />
                            <TrackerStep label="Shortlisted" active={shortlistedActive} complete={shortlistedComplete} orientation="horizontal" />
                            <TrackerLine active={shortlistedActive} orientation="horizontal" />
                            <TrackerStep label="Submitted" active={submittedActive} complete={submittedComplete} orientation="horizontal" />
                            <TrackerLine active={submittedActive} orientation="horizontal" />
                            <TrackerStep label="Interview" active={interviewActive} complete={interviewComplete} orientation="horizontal" />
                            <TrackerLine active={interviewActive} orientation="horizontal" />
                            <TrackerStep label="Result" active={resultActive} complete={resultActive} pulse={st === 'SELECTED'} orientation="horizontal" />
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex sm:hidden flex-col gap-0 pl-7 relative">
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[#F1F5F9] -z-0" />
                      {(() => {
                        const st = normBadge(intern.status);
                        const shortlistedActive = st !== 'APPLIED';
                        const shortlistedComplete = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedActive = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedComplete = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewActive = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewComplete = st === 'SELECTED';
                        const resultActive = ['SELECTED','REJECTED'].includes(st);
                        return (
                          <>
                            <TrackerStep label="Applied" active complete orientation="vertical" />
                            <TrackerStep label="Shortlisted" active={shortlistedActive} complete={shortlistedComplete} orientation="vertical" />
                            <TrackerStep label="Submitted" active={submittedActive} complete={submittedComplete} orientation="vertical" />
                            <TrackerStep label="Interview" active={interviewActive} complete={interviewComplete} orientation="vertical" />
                            <TrackerStep label="Result" active={resultActive} complete={resultActive} pulse={st === 'SELECTED'} orientation="vertical" />
                          </>
                        );
                      })()}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                        intern.status === "accepted" || intern.status === "reviewed"
                          ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                          : intern.status === "rejected"
                          ? "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]"
                          : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                      }`}
                    >
                      {intern.status}
                    </span>
                  </div>
                  <button className="w-full lg:w-auto p-3 rounded-xl bg-[#F8FAFC] text-[#64748B] border border-[#E1E8F2] hover:bg-[#F2ECFF] hover:text-[#6D3DF5] hover:border-[#E9E1FF] transition-all shadow-xs flex items-center justify-center gap-2 shrink-0">
                    <span className="lg:hidden text-xs font-bold">Details</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-8 text-center">
              <h4 className="text-base font-bold text-[#172554] mb-1.5">No internships yet</h4>
              <p className="text-xs text-[#64748B]">Apply to tasks and submit your work to see your progress here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const normBadge = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'applied' || v === 'pending') return 'APPLIED';
  if (v === 'shortlisted' || v === 'task') return 'SHORTLISTED';
  if (v === 'submitted' || v === 'reviewed') return 'SUBMITTED';
  if (v === 'interview_scheduled' || v === 'interview') return 'INTERVIEW_SCHEDULED';
  if (v === 'hired' || v === 'offer' || v === 'approved') return 'SELECTED';
  if (v === 'rejected') return 'REJECTED';
  return 'APPLIED';
};

const badgeCls = (badge) => {
  return {
    APPLIED: 'bg-slate-100 text-slate-700 border border-slate-200',
    SHORTLISTED: 'bg-amber-100 text-amber-700 border border-amber-200',
    SUBMITTED: 'bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF]',
    INTERVIEW_SCHEDULED: 'bg-[#F5F1FF] text-[#7C3AED] border border-[#EDE9FE]',
    SELECTED: 'bg-green-100 text-green-700 border border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200'
  }[badge] || 'bg-slate-100 text-slate-700 border border-slate-200';
};

const TrackerStep = ({
  label,
  active,
  complete,
  pulse,
  orientation = "horizontal"
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className="flex flex-col items-center gap-2 px-1 text-center shrink-0">
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${complete ? 'bg-[#6D3DF5] text-white' : active ? 'bg-[#F3EEFF] text-[#6D3DF5] ring-4 ring-[#F3EEFF]/60' : 'bg-[#F8FAFC] text-[#CBD5E1]'} ${pulse ? 'animate-bounce' : ''}`}>
          {complete ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </div>
        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#172554]' : 'text-[#CBD5E1]'}`}>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 py-2 relative z-10">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${complete ? 'bg-[#6D3DF5] text-white shadow-xs' : active ? 'bg-[#F3EEFF] text-[#6D3DF5] ring-4 ring-[#F3EEFF]/60' : 'bg-white border-2 border-[#E1E8F2] text-[#CBD5E1]'} ${pulse ? 'animate-pulse' : ''}`}>
        {complete ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-[#172554]' : 'text-[#CBD5E1]'}`}>{label}</span>
    </div>
  );
};

const TrackerLine = ({ active, orientation = "horizontal" }) => (
  <div className={`flex-1 rounded-full overflow-hidden ${orientation === 'horizontal' ? 'h-1 bg-[#F1F5F9] mx-1' : 'w-1 bg-[#F1F5F9] my-1'}`}>
    <motion.div
      initial={{ width: 0, height: 0 }}
      animate={orientation === 'horizontal' ? { width: active ? '100%' : '0%' } : { height: active ? '100%' : '0%' }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`bg-[#6D3DF5] ${orientation === 'horizontal' ? 'h-full' : 'w-full'}`}
    />
  </div>
);
