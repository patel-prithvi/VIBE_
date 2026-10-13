import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Briefcase } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { InstructionModal } from './InstructionModal';
import { ApplicationFormModal } from './ApplicationFormModal';
import { MentorRequestModal } from './MentorRequestModal';
import api from '../../services/api';

export const TaskManiaView = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
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
    setSelectedTask(task);
    setIsInstructionOpen(true);
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
      
      alert('Application submitted successfully!');
      setIsApplicationOpen(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Briefcase size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black">TaskMania</h2>
            <p className="text-orange-100">Solve real industry challenges and get hired</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-2xl font-bold">
              {tasks.filter(t => !(typeof t.deadlineTs === 'number' && Date.now() > t.deadlineTs)).length}
            </p>
            <p className="text-sm text-orange-100">Active Tasks</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-2xl font-bold">{submittedTasks.length}</p>
            <p className="text-sm text-orange-100">Applied</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-2xl font-bold">{tasks.filter(t => t.paid).length}</p>
            <p className="text-sm text-orange-100">Paid Tasks</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks, companies, or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-11 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all appearance-none bg-white cursor-pointer min-w-[180px]"
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
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all appearance-none bg-white cursor-pointer min-w-[140px]"
            >
              {modes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{filteredTasks.length}</span> of <span className="font-bold text-gray-900">{tasks.length}</span> tasks
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
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        task={selectedTask}
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
