import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../utils/auth';
import api from '../../services/api';
import Avatar from '../shared/Avatar';
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
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Loader2
} from 'lucide-react';

export const ProfileView = ({ user, onProfileUpdate }) => {
  const [internships, setInternships] = useState([]);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || '',
    mobileNo: user.mobileNo || '',
    dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    institutionName: user.Profile?.InstituteName || '',
    degree: user.Profile?.degree || 'B.Tech',
    branch: user.Profile?.branch || '',
    currentYear: user.Profile?.yearOfStudy || '1st Year'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await auth.updateProfile(user._id, formData);
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
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
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/submissions/me');
        const items = (res.data?.data || []).map(s => {
          const st = String(s.status || '').toLowerCase();
          return {
            id: String(s._id),
            company: s.taskId?.createdBy?.Profile?.InstituteName || s.taskId?.createdBy?.name || s.taskId?.companyName || 'Unknown',
            role: s.taskId?.roleOffered || 'Intern',
            appliedDate: new Date(s.createdAt).toLocaleDateString("en-GB"),
            status: st,
          };
        });
        if (mounted) setInternships(items);
      } catch (e) {
        if (mounted) setInternships([]);
      }
    })();
    return () => { mounted = false; };
  }, []);
  
  const inputClasses = `w-full px-5 py-3.5 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium shadow-sm hover:bg-white/60 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`;

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Profile Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-6 md:p-10 border border-white shadow-xl flex flex-col md:flex-row items-center gap-8"
      >
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr from-orange-500 to-amber-300 p-1">
            <Avatar 
              name={user.name} 
              src={user.avatar} 
              className="w-full h-full rounded-[1.8rem] md:rounded-[2.2rem] border-4 border-white" 
              initialsClassName="text-3xl md:text-4xl"
            />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-[2.3rem] md:rounded-[2.8rem] border-2 border-dashed border-orange-500/30 -z-10"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2 w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{user.name}</h2>
            <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[10px] md:text-xs font-black uppercase tracking-widest ring-1 ring-orange-200">
              {user.role}
            </span>
          </div>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            {formData.degree} Student • {formData.branch || 'Engineering'}
          </p>
          
          <div className="pt-4 max-w-sm mx-auto md:mx-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs md:text-sm font-bold text-gray-400">Profile Completion</span>
              <span className="text-xs md:text-sm font-black text-orange-600">85%</span>
            </div>
            <div className="h-2.5 md:h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleEditClick}
          disabled={loading}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${isEditing ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} shadow-lg`}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Edit3 size={18} />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </motion.section>

      {/* 2. Stepper Form Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${step === 1 ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 border border-orange-100'} shadow-lg transition-colors`}>
            <User size={24} />
          </div>
          <div className="h-px w-4 md:w-8 bg-gray-200" />
          <div className={`p-3 rounded-2xl ${step === 2 ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 border border-orange-100'} shadow-lg transition-colors`}>
            <GraduationCap size={24} />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 ml-2">
            {step === 1 ? 'Personal Information' : 'Academic Information'}
          </h3>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-white shadow-xl">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
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
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" value={user.email} disabled className={inputClasses + " opacity-60 cursor-not-allowed"} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses} 
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-4">
                  <button onClick={() => setStep(2)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-gray-800 transition-all group">
                    Next Step <ChevronRight size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">College Name</label>
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
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Degree</label>
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
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Branch / Specialization</label>
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
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Year</label>
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
                <div className="md:col-span-2 flex flex-col md:flex-row justify-between gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="flex items-center justify-center gap-2 text-gray-500 font-bold px-4 py-2 hover:text-gray-900 transition-colors">
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={!isEditing || loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Complete Profile 
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      {/* 3. Change Password Section */}
      <section className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-white shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-1 space-y-4">
          <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-100">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Security Center</h3>
          <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
            Protect your account by using a strong password. We recommend a mix of symbols, numbers, and capital letters.
          </p>
          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <p className="text-xs text-orange-700 font-bold leading-relaxed">
              Last password change was 3 months ago. Security experts recommend changing it every 6 months.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Current Password" 
              className={inputClasses + " pr-12"} 
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="password" placeholder="New Password" className={inputClasses} />
            <input type="password" placeholder="Confirm Password" className={inputClasses} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 px-1">
              <span>Password Strength</span>
              <span className="text-orange-600">Strong</span>
            </div>
            <div className="flex gap-1.5 h-1.5">
              <div className="flex-1 rounded-full bg-orange-500" />
              <div className="flex-1 rounded-full bg-orange-500" />
              <div className="flex-1 rounded-full bg-orange-500" />
              <div className="flex-1 rounded-full bg-orange-200" />
            </div>
          </div>

          <button 
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
          >
            Update Password <Lock size={18} />
          </button>
        </div>
      </section>
      {/* 4. Internship Tracker */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
              <Briefcase size={24} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900">Internship Tracker</h3>
          </div>
          <button className="text-sm font-bold text-orange-600 hover:underline">View All History</button>
        </div>

        <div className="grid gap-6">
          {internships.length > 0 ? (
            internships.map((intern, i) => (
              <motion.div 
                key={intern.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white shadow-xl hover:shadow-2xl hover:shadow-orange-100/50 transition-all group overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex items-center gap-5 min-w-fit md:min-w-[200px]">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-xl text-gray-300 shrink-0">
                      {intern.company[0]}
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-black text-gray-900">{intern.company}</h4>
                      <p className="text-orange-600 font-bold text-xs md:text-sm">{intern.role}</p>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[10px] md:text-xs font-bold mt-1 uppercase tracking-wider">
                        <Calendar size={12} /> {intern.appliedDate}
                      </div>
                      {(() => {
                        const norm = (s) => {
                          const v = String(s || '').toLowerCase();
                          if (v === 'applied' || v === 'pending') return 'APPLIED';
                          if (v === 'shortlisted' || v === 'task') return 'SHORTLISTED';
                          if (v === 'submitted' || v === 'reviewed') return 'SUBMITTED';
                          if (v === 'interview_scheduled' || v === 'interview') return 'INTERVIEW_SCHEDULED';
                          if (v === 'hired' || v === 'offer' || v === 'approved') return 'SELECTED';
                          if (v === 'rejected') return 'REJECTED';
                          return 'APPLIED';
                        };
                        const badge = norm(intern.status);
                        const cls = {
                          APPLIED: 'bg-slate-100 text-slate-700 border border-slate-200',
                          SHORTLISTED: 'bg-amber-100 text-amber-700 border border-amber-200',
                          SUBMITTED: 'bg-teal-100 text-teal-700 border border-teal-200',
                          INTERVIEW_SCHEDULED: 'bg-blue-100 text-blue-700 border border-blue-200',
                          SELECTED: 'bg-green-100 text-green-700 border border-green-200',
                          REJECTED: 'bg-red-100 text-red-700 border border-red-200'
                        }[badge] || 'bg-slate-100 text-slate-700 border border-slate-200';
                        return (
                          <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-black ${cls}`}>
                            {badge.replace('_',' ')}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="hidden sm:flex items-center justify-between w-full overflow-x-auto py-2 no-scrollbar">
                      {(() => {
                        const norm = (s) => {
                          const v = String(s || '').toLowerCase();
                          if (v === 'applied' || v === 'pending') return 'APPLIED';
                          if (v === 'shortlisted' || v === 'task') return 'SHORTLISTED';
                          if (v === 'submitted' || v === 'reviewed') return 'SUBMITTED';
                          if (v === 'interview_scheduled' || v === 'interview') return 'INTERVIEW_SCHEDULED';
                          if (v === 'hired' || v === 'offer' || v === 'approved') return 'SELECTED';
                          if (v === 'rejected') return 'REJECTED';
                          return 'APPLIED';
                        };
                        const st = norm(intern.status);
                        const appliedActive = true;
                        const appliedComplete = true;
                        const shortlistedActive = st !== 'APPLIED';
                        const shortlistedComplete = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedActive = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedComplete = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewActive = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewComplete = st === 'SELECTED';
                        const resultActive = ['SELECTED','REJECTED'].includes(st);
                        const resultComplete = ['SELECTED','REJECTED'].includes(st);
                        const resultPulse = st === 'SELECTED';
                        return (
                          <>
                            <TrackerStep label="Applied" active={appliedActive} complete={appliedComplete} orientation="horizontal" />
                            <TrackerLine active={appliedActive} orientation="horizontal" />
                            <TrackerStep label="Shortlisted" active={shortlistedActive} complete={shortlistedComplete} orientation="horizontal" />
                            <TrackerLine active={shortlistedActive} orientation="horizontal" />
                            <TrackerStep label="Submitted" active={submittedActive} complete={submittedComplete} orientation="horizontal" />
                            <TrackerLine active={submittedActive} orientation="horizontal" />
                            <TrackerStep label="Interview" active={interviewActive} complete={interviewComplete} orientation="horizontal" />
                            <TrackerLine active={interviewActive} orientation="horizontal" />
                            <TrackerStep label="Result" active={resultActive} complete={resultComplete} pulse={resultPulse} orientation="horizontal" />
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex sm:hidden flex-col gap-0 pl-7 relative">
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 -z-0" />
                      {(() => {
                        const norm = (s) => {
                          const v = String(s || '').toLowerCase();
                          if (v === 'applied' || v === 'pending') return 'APPLIED';
                          if (v === 'shortlisted' || v === 'task') return 'SHORTLISTED';
                          if (v === 'submitted' || v === 'reviewed') return 'SUBMITTED';
                          if (v === 'interview_scheduled' || v === 'interview') return 'INTERVIEW_SCHEDULED';
                          if (v === 'hired' || v === 'offer' || v === 'approved') return 'SELECTED';
                          if (v === 'rejected') return 'REJECTED';
                          return 'APPLIED';
                        };
                        const st = norm(intern.status);
                        const appliedActive = true;
                        const appliedComplete = true;
                        const shortlistedActive = st !== 'APPLIED';
                        const shortlistedComplete = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedActive = ['SUBMITTED','INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const submittedComplete = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewActive = ['INTERVIEW_SCHEDULED','SELECTED'].includes(st);
                        const interviewComplete = st === 'SELECTED';
                        const resultActive = ['SELECTED','REJECTED'].includes(st);
                        const resultComplete = ['SELECTED','REJECTED'].includes(st);
                        const resultPulse = st === 'SELECTED';
                        return (
                          <>
                            <TrackerStep label="Applied" active={appliedActive} complete={appliedComplete} orientation="vertical" />
                            <TrackerStep label="Shortlisted" active={shortlistedActive} complete={shortlistedComplete} orientation="vertical" />
                            <TrackerStep label="Submitted" active={submittedActive} complete={submittedComplete} orientation="vertical" />
                            <TrackerStep label="Interview" active={interviewActive} complete={interviewComplete} orientation="vertical" />
                            <TrackerStep label="Result" active={resultActive} complete={resultComplete} pulse={resultPulse} orientation="vertical" />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button className="w-full lg:w-auto p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                    <span className="lg:hidden font-bold">Details</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center">
              <h4 className="text-lg font-bold text-slate-900 mb-2">No internships yet</h4>
              <p className="text-sm text-slate-600">Apply to tasks and submit your work to see your progress here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
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
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${complete ? 'bg-orange-500 text-white' : active ? 'bg-orange-100 text-orange-600 ring-4 ring-orange-50' : 'bg-gray-50 text-gray-300'} ${pulse ? 'animate-bounce' : ''}`}>
          {complete ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </div>
        <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${active ? 'text-gray-900' : 'text-gray-300'}`}>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 py-2 relative z-10">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${complete ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : active ? 'bg-orange-100 text-orange-600 ring-4 ring-orange-50' : 'bg-white border-2 border-gray-100 text-gray-300'} ${pulse ? 'animate-pulse' : ''}`}>
        {complete ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-gray-900' : 'text-gray-300'}`}>{label}</span>
    </div>
  );
};

const TrackerLine = ({ active, orientation = "horizontal" }) => (
  <div className={`flex-1 rounded-full overflow-hidden ${orientation === 'horizontal' ? 'h-1 bg-gray-50 mx-1' : 'w-1 bg-gray-50 my-1'}`}>
    <motion.div 
      initial={{ width: 0, height: 0 }}
      animate={orientation === 'horizontal' ? { width: active ? '100%' : '0%' } : { height: active ? '100%' : '0%' }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`bg-orange-500 ${orientation === 'horizontal' ? 'h-full' : 'w-full'}`}
    />
  </div>
);
