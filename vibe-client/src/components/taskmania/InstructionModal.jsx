import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertCircle } from 'lucide-react';

export const InstructionModal = ({ isOpen, onClose, task }) => {
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
          className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <BookOpen size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Task Instructions</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              <p className="text-gray-500">{task.company}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Overview</h3>
              <p className="text-gray-600 leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs">!</span>
                Steps to Complete
              </h3>
              <ul className="space-y-4">
                {task.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white text-orange-600 font-bold text-sm border border-orange-100 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>Please ensure you read all requirements carefully. Submissions that do not meet the core criteria listed above will be automatically rejected by the system.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              Got it, close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

