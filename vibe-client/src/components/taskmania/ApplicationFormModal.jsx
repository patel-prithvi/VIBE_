import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Github, AlertTriangle, Youtube, HardDrive, Link as LinkIcon, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const ApplicationFormModal = ({ 
  isOpen, 
  onClose, 
  task,
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    githubUrl: '',
    videoUrl: '',
    googleDriveUrl: '',
    additionalLinks: []
  });
  
  const [newLink, setNewLink] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        projectTitle: '', 
        description: '', 
        githubUrl: '',
        videoUrl: '',
        googleDriveUrl: '',
        additionalLinks: []
      });
      setNewLink('');
      setErrors({});
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen, task]);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.githubUrl.trim()) {
      newErrors.githubUrl = 'GitHub URL is required';
    } else if (!validateUrl(formData.githubUrl)) {
      newErrors.githubUrl = 'Invalid URL';
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video Demo URL is required';
    } else if (!validateUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Invalid URL';
    }

    if (formData.googleDriveUrl && !validateUrl(formData.googleDriveUrl)) {
      newErrors.googleDriveUrl = 'Invalid URL';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const addAdditionalLink = () => {
    if (!newLink.trim()) return;
    
    if (!validateUrl(newLink)) {
      setErrors(prev => ({ ...prev, newLink: 'Please enter a valid URL (e.g., https://...)' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      additionalLinks: [...prev.additionalLinks, newLink.trim()]
    }));
    setNewLink('');
    setErrors(prev => ({ ...prev, newLink: undefined }));
  };

  const removeAdditionalLink = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalLinks: prev.additionalLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;
    if (typeof task.deadlineTs === "number" && Date.now() > task.deadlineTs) {
      alert("This task is closed. The deadline has passed.");
      return;
    }

    const currentErrors = validate();
    
    // If there are errors, focus on the first one
    if (Object.keys(currentErrors).length > 0) {
      const firstErrorField = Object.keys(currentErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);
    await onSubmit(task.id, formData);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
        >
          {isSuccess ? (
             <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
               <motion.div 
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", stiffness: 200, damping: 15 }}
                 className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-xl shadow-green-100"
               >
                 <CheckCircle2 size={48} strokeWidth={3} />
               </motion.div>
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                 <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
                 <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                   Your solution for <span className="font-bold text-gray-900">{task.title}</span> has been successfully recorded. Good luck!
                 </p>
                 <button 
                   onClick={onClose}
                   className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                 >
                   Back to Dashboard
                 </button>
               </motion.div>
             </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 flex justify-between items-start text-white flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold">Submit Solution</h2>
                  <p className="text-orange-100 text-sm mt-1 opacity-90">Applying for: {task.title}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="application-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Project Details</h3>
                    
                    <div>
                      <label htmlFor="projectTitle" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Project Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        id="projectTitle"
                        type="text"
                        placeholder="e.g., E-Commerce Analytics Dashboard"
                        value={formData.projectTitle}
                        onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.projectTitle ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-100 focus:border-orange-400'} focus:outline-none focus:ring-4 transition-all`}
                      />
                      {errors.projectTitle && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> {errors.projectTitle}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        id="description"
                        rows={4}
                        placeholder="Explain your approach, technologies used, and any challenges faced..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-100 focus:border-orange-400'} focus:outline-none focus:ring-4 transition-all resize-none`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Required Links */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Required Links</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="githubUrl" className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <Github size={16} /> GitHub Repo <span className="text-red-500">*</span>
                        </label>
                        <input 
                          id="githubUrl"
                          type="text"
                          placeholder="https://github.com/..."
                          value={formData.githubUrl}
                          onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.githubUrl ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-100 focus:border-orange-400'} focus:outline-none focus:ring-4 transition-all`}
                        />
                        {errors.githubUrl && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle size={12} /> {errors.githubUrl}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="videoUrl" className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                          <Youtube size={16} /> Video Demo <span className="text-red-500">*</span>
                        </label>
                        <input 
                          id="videoUrl"
                          type="text"
                          placeholder="https://youtube.com/..."
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.videoUrl ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-100 focus:border-orange-400'} focus:outline-none focus:ring-4 transition-all`}
                        />
                        {errors.videoUrl && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle size={12} /> {errors.videoUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Links */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Additional Resources <span className="text-xs font-normal text-gray-500">(Optional)</span></h3>
                    
                    <div>
                      <label htmlFor="googleDriveUrl" className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <HardDrive size={16} /> Google Drive Link
                      </label>
                      <input 
                        id="googleDriveUrl"
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={formData.googleDriveUrl}
                        onChange={(e) => setFormData({...formData, googleDriveUrl: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.googleDriveUrl ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-100 focus:border-orange-400'} focus:outline-none focus:ring-4 transition-all`}
                      />
                      {errors.googleDriveUrl && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> {errors.googleDriveUrl}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <LinkIcon size={16} /> Other Links
                      </label>
                      
                      {/* Dynamic Link List */}
                      {formData.additionalLinks.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {formData.additionalLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 group">
                              <div className="p-1.5 bg-white rounded-md shadow-sm text-orange-500">
                                <LinkIcon size={14} />
                              </div>
                              <span className="text-sm text-gray-600 truncate flex-1">{link}</span>
                              <button 
                                type="button"
                                onClick={() => removeAdditionalLink(idx)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Add any other relevant URL..."
                          value={newLink}
                          onChange={(e) => setNewLink(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addAdditionalLink();
                            }
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg border ${errors.newLink ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all text-sm`}
                        />
                        <button 
                          type="button"
                          onClick={addAdditionalLink}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                      {errors.newLink && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> {errors.newLink}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium shadow-lg shadow-orange-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

