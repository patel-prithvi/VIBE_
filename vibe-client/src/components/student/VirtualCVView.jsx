import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Star, 
  TrendingUp, 
  Target, 
  Award, 
  ExternalLink, 
  Share2, 
  Download,
  Briefcase,
  Code,
  Quote,
  CheckCircle,
  MapPin,
  Github,
  Linkedin
} from 'lucide-react';

const mockSkills = [
  { name: 'React.js', level: 'Advanced', score: 92, verified: true, category: 'Technical' },
  { name: 'TypeScript', level: 'Intermediate', score: 85, verified: true, category: 'Technical' },
  { name: 'Node.js', level: 'Intermediate', score: 78, verified: false, category: 'Technical' },
  { name: 'Figma', level: 'Advanced', score: 88, verified: true, category: 'Tools' },
  { name: 'Git & GitHub', level: 'Advanced', score: 95, verified: true, category: 'Tools' },
  { name: 'Public Speaking', level: 'Intermediate', score: 82, verified: true, category: 'Soft Skills' },
  { name: 'Team Leadership', level: 'Advanced', score: 90, verified: true, category: 'Soft Skills' },
];

const mockExperience = [
  {
    id: '1',
    company: 'TechFlow Systems',
    role: 'Frontend Developer Intern',
    duration: 'Jun 2024 - Present',
    description: 'Leading the migration of core dashboard components to React 19 and improving performance by 40%.',
    type: 'Internship',
    verified: true
  },
  {
    id: '2',
    company: 'Freelance',
    role: 'UI Designer',
    duration: 'Jan 2024 - May 2024',
    description: 'Designed and developed 5+ landing pages for local startups using Tailwind CSS and Framer Motion.',
    type: 'Freelance',
    verified: false
  }
];

const mockProjects = [
  {
    id: '1',
    title: 'EcoTrack Dashboard',
    description: 'A carbon footprint monitoring tool with real-time data visualization.',
    skills: ['React', 'D3.js', 'Firebase'],
    impact: 'Reduced data processing time by 60%',
    thumbnail: 'https://picsum.photos/seed/project1/400/250'
  },
  {
    id: '2',
    title: 'VIBE Community Hub',
    description: 'The central social platform for student engagement and mentorship.',
    skills: ['Next.js', 'Tailwind', 'Three.js'],
    impact: 'Onboarded 500+ students in first week',
    thumbnail: 'https://picsum.photos/seed/project2/400/250'
  }
];

export const VirtualCVView = ({ user }) => {
  return (
    <div className="space-y-12 pb-24">
      {/* 1. CV Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-rose-500 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-white/20 rounded-full"
            />
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-10">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white text-orange-600 p-2 rounded-xl shadow-lg z-20">
              <ShieldCheck size={24} />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{user.name}</h1>
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                  Verified Student
                </span>
              </div>
              <p className="text-xl text-orange-100 font-medium">B.Tech in Computer Science Engineering • 3rd Year</p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-orange-200 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> Gujarat, India</span>
                <span className="flex items-center gap-1.5 text-emerald-300"><CheckCircle size={14} /> Available for Internship</span>
              </div>
            </div>

            {/* Social Links & Actions */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <div className="flex gap-2">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white hover:text-orange-600 transition-all"
                >
                  <Github size={22} />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white hover:text-orange-600 transition-all"
                >
                  <Linkedin size={22} />
                </a>
              </div>
              <div className="h-10 w-px bg-white/20 self-center hidden md:block" />
              <button className="flex items-center gap-2 bg-white text-orange-600 px-8 py-3.5 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">
                <Share2 size={18} /> Share Profile
              </button>
              <button className="flex items-center gap-2 bg-orange-500/30 backdrop-blur-md border border-white/30 px-8 py-3.5 rounded-2xl font-black shadow-lg hover:bg-orange-500/50 transition-all">
                <Download size={18} /> Export CV
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center min-w-[160px]">
            <span className="text-xs font-black uppercase tracking-widest text-orange-100 block mb-1">Credibility Score</span>
            <div className="text-5xl font-black text-white mb-2">940</div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Performance Snapshot */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Internships" value="3" color="orange" />
        <StatCard icon={Target} label="Task Accuracy" value="98%" color="emerald" />
        <StatCard icon={Star} label="Mentor Rating" value="4.9" color="amber" />
        <StatCard icon={TrendingUp} label="Skill Index" value="8.4" color="orange" />
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 3. Skills Matrix */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Skills Matrix</h3>
          </div>

          <div className="space-y-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl">
            {['Technical', 'Tools', 'Soft Skills'].map((cat) => (
              <div key={cat} className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{cat}</h4>
                <div className="space-y-4">
                  {mockSkills.filter(s => s.category === cat).map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          {skill.name}
                          {skill.verified && <ShieldCheck size={14} className="text-orange-500" />}
                        </span>
                        <span className="text-xs font-black text-orange-600">{skill.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.score}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-orange-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 & 5. Experience & Projects */}
        <div className="lg:col-span-2 space-y-12">
          {/* Experience Timeline */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Experience</h3>
              </div>
            </div>

            <div className="space-y-6">
              {mockExperience.map((exp, idx) => (
                <motion.div 
                  key={exp.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl flex gap-6 group"
                >
                  <div className="hidden sm:flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${exp.verified ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {exp.company[0]}
                    </div>
                    {idx < mockExperience.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-4" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{exp.role}</h4>
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                          {exp.company}
                          {exp.verified && <span className="bg-orange-50 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified By Vibe</span>}
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">{exp.duration}</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed text-sm">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Projects Showcase */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <Code size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Featured Projects</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProjects.map((project, idx) => (
                <div 
                  key={project.id}
                  className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl overflow-hidden group"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img src={project.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <button className="bg-white text-gray-900 p-3 rounded-2xl shadow-xl">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <h4 className="text-xl font-black text-gray-900">{project.title}</h4>
                    <p className="text-gray-500 text-sm line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <TrendingUp size={14} /> {project.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Feedback Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Quote size={24} />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Mentor Highlights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl flex gap-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 shrink-0 overflow-hidden">
              <img src="https://picsum.photos/seed/mentor1/200" alt="Mentor" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <p className="text-gray-600 italic leading-relaxed">"Parth consistently delivers high-quality work. His attention to detail in UI performance is exceptional for a student."</p>
              <div>
                <h5 className="font-black text-gray-900 text-sm">Prof. Anjali Sharma</h5>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">HOD, Computer Engineering</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl flex gap-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 shrink-0 overflow-hidden">
              <img src="https://picsum.photos/seed/mentor2/200" alt="Mentor" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <p className="text-gray-600 italic leading-relaxed">"Impressive growth in his React skills. He managed to solve complex state management issues during the hackathon."</p>
              <div>
                <h5 className="font-black text-gray-900 text-sm">Rahul Verma</h5>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lead Engineer @ TechFlow</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div 
      className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl flex items-center gap-6"
    >
      <div className={`p-4 rounded-2xl ${colors[color] || colors.orange} shadow-sm`}>
        <Icon size={28} />
      </div>
      <div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">{label}</span>
        <span className="text-3xl font-black text-gray-900 tracking-tight">{value}</span>
      </div>
    </div>
  );
};