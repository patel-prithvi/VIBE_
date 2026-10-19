import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Briefcase } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { InstructionModal } from './InstructionModal';
import { ApplicationFormModal } from './ApplicationFormModal';
import { MentorRequestModal } from './MentorRequestModal';
import api from '../../services/api';
import { useToast } from '../Toast';

export const TaskManiaView = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskForInstructions, setSelectedTaskForInstructions] = useState(null);
  const [searchQuery, setSearchQuery] = useState(
    () => sessionStorage.getItem('vibe_taskmania_search') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => sessionStorage.getItem('vibe_taskmania_category') || 'All'
  );
  const [selectedMode, setSelectedMode] = useState(
    () => sessionStorage.getItem('vibe_taskmania_mode') || 'All'
  );
  const [selectedTask, setSelectedTask] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMentorRequestOpen, setIsMentorRequestOpen] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Development', 'Design', 'AI/ML', 'Web Development', 'Healthcare'];
  const modes = ['All', 'Remote', 'Onsite', 'Hybrid'];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const [tasksRes, subsRes, mentorRequestsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/submissions/me'),
          api.get('/mentor-requests/my-requests')
        ]);

        if (tasksRes.data && tasksRes.data.data) {
          const mappedTasks = tasksRes.data.data.map(task => ({
            id: task._id,
            title: task.title,
            // Use real companyName from DB; fall back to creator name if empty
            company: (task.companyName && task.companyName.trim())
              ? task.companyName.trim()
              : (task.createdBy?.name || 'Unknown Company'),
            companyId: task.createdBy?._id || task.createdBy,
            createdBy: task.createdBy,
            role: task.roleOffered,
            category: 'Development',
            mode: task.location || 'Remote',
            paid: task.packageRange !== 'Unpaid',
            deadline: new Date(task.lastDateToSubmit).toLocaleDateString(),
            deadlineTs: new Date(task.lastDateToSubmit).getTime(),
            tags: task.skillsRequired || [],
            // Use real perks from DB (stored as comma-separated string)
            perks: (task.perks && task.perks.trim())
              ? task.perks.split(',').map(p => p.trim()).filter(Boolean)
              : [],
            description: task.description,
            instructions: task.instructions || []
          }));
          setTasks(mappedTasks);
        }

        if (subsRes.data && Array.isArray(subsRes.data.data)) {
          const appliedTaskIds = subsRes.data.data
            .map((s) => String(s.taskId?._id || s.taskId))
            .filter(Boolean);
          setSubmittedTasks(appliedTaskIds);
        }

        if (mentorRequestsRes.data && Array.isArray(mentorRequestsRes.data.data)) {
          setMentorRequests(mentorRequestsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchesMode = selectedMode === 'All' || task.mode === selectedMode;
    
    return matchesSearch && matchesCategory && matchesMode;
  });

  const handleOpenInstructions = (task) => {
    setSelectedTaskForInstructions(task);
  };

  const handleOpenApply = (task) => {
    setSelectedTask(task);
    setIsApplicationOpen(true);
  };

  const handleOpenMentorRequest = (task) => {
    setSelectedTask(task);
    setIsMentorRequestOpen(true);
  };

  const handleSubmitApplication = async (taskId, formData) => {
    try {
      const payload = {
        taskId,
        projectTitle: formData.projectTitle || '',
        repoUrl: formData.githubUrl || '',
        videoUrl: formData.videoUrl || '',
        driveUrl: formData.googleDriveUrl || '',
        additionalLinks: Array.isArray(formData.additionalLinks) ? formData.additionalLinks : [],
        message: formData.description || ''
      };

      await api.post('/submissions/submit', payload);
      
      // Add to submitted tasks
      setSubmittedTasks(prev => [...prev, taskId]);
      
      toast.success('Application submitted successfully!');
      setIsApplicationOpen(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center flex-shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#172554] tracking-tight">TaskMania</h2>
            <p className="text-xs md:text-sm text-[#64748B] font-medium">Solve real industry challenges and get hired</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-5">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-xl md:text-2xl font-black text-[#172554] tracking-tight">
              {tasks.filter(t => !(typeof t.deadlineTs === 'number' && Date.now() > t.deadlineTs)).length}
            </p>
            <p className="text-[11px] md:text-xs text-[#64748B] font-semibold mt-0.5">Active Tasks</p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-xl md:text-2xl font-black text-[#172554] tracking-tight">{submittedTasks.length}</p>
            <p className="text-[11px] md:text-xs text-[#64748B] font-semibold mt-0.5">Applied</p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-xl md:text-2xl font-black text-[#172554] tracking-tight">{tasks.filter(t => t.paid).length}</p>
            <p className="text-[11px] md:text-xs text-[#64748B] font-semibold mt-0.5">Paid Tasks</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row gap-3.5">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
            <input
              type="text"
              placeholder="Search tasks, companies, or technologies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                sessionStorage.setItem('vibe_taskmania_search', e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                sessionStorage.setItem('vibe_taskmania_category', e.target.value);
              }}
              className="pl-10 pr-8 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all appearance-none cursor-pointer min-w-[180px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Mode Filter */}
          <div className="relative">
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                sessionStorage.setItem('vibe_taskmania_mode', e.target.value);
              }}
              className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all appearance-none cursor-pointer min-w-[140px]"
            >
              {modes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3.5 text-xs text-[#64748B]">
          Showing <span className="font-bold text-[#0F172A]">{filteredTasks.length}</span> of <span className="font-bold text-[#0F172A]">{tasks.length}</span> tasks
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <TaskCard
                key={task.id}
                task={task}
                isSubmitted={submittedTasks.includes(task.id)}
                mentorRequest={mentorRequests.find(req => String(req.task?._id || req.task) === task.id)}
                onOpenInstructions={handleOpenInstructions}
                onOpenApply={handleOpenApply}
                onOpenMentorRequest={handleOpenMentorRequest}
              />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] border border-[#E1E8F2] flex items-center justify-center mx-auto mb-4">
            <Search size={26} />
          </div>
          <h3 className="text-lg font-bold text-[#172554] mb-1.5">No tasks found</h3>
          <p className="text-xs text-[#64748B]">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      <InstructionModal
        isOpen={Boolean(selectedTaskForInstructions)}
        onClose={() => setSelectedTaskForInstructions(null)}
        task={selectedTaskForInstructions}
        onViewDetails={(task) => {
          setSelectedTaskForInstructions(null);
          navigate(`/tasks/${task.id || task._id}`);
        }}
        onOpenApply={(task) => {
          setSelectedTaskForInstructions(null);
          handleOpenApply(task);
        }}
      />

      <ApplicationFormModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onSubmit={handleSubmitApplication}
        task={selectedTask}
      />

      <MentorRequestModal
        isOpen={isMentorRequestOpen}
        onClose={() => setIsMentorRequestOpen(false)}
        task={selectedTask}
      />
    </div>
  );
};
