import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  User,
  FileUser,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { auth } from '../../utils/auth';
import Avatar from '../shared/Avatar';

const menuItems = [
  { id: 'posts', label: 'Community Posts', icon: MessageSquare },
  { id: 'taskmania', label: 'TaskMania', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'virtual-cv', label: 'Virtual CV', icon: FileUser },
];

export const Sidebar = ({ user, activeView, onNavigate }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const handleNavigation = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    
    // Scroll to top when navigating to a new section
    setTimeout(() => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      // Also scroll window to top as fallback
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100); // Small delay to ensure navigation completes
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-4 py-2">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300
                ${activeView === item.id
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-orange-600'}
              `}
            >
              <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 2} />
              <span className="text-xs font-semibold">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-500 hover:text-orange-600 transition-all duration-300"
          >
            <User size={20} />
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </div>

      {/* Mobile Profile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <div
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 shadow-2xl"
            >
              {/* User Profile Section */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <Avatar
                  name={user.name}
                  src={user.avatar}
                  className="w-16 h-16 rounded-2xl ring-2 ring-orange-500/20 shadow-lg"
                  initialsClassName="text-2xl"
                />
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">{user.name}</h3>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => handleNavigation('profile')}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300"
                >
                  <User size={20} />
                  <span className="font-semibold">View Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </>
        )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-80 xl:w-96 p-6 z-50">
        <div
          className="h-full bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* User Profile Section */}
          <div className="p-8 border-b border-gray-100/50">
            <div
              onClick={() => handleNavigation('profile')}
              className="flex items-center gap-4 cursor-pointer"
            >
              <div className="relative">
                <Avatar
                  name={user.name}
                  src={user.avatar}
                  className="w-16 h-16 rounded-2xl ring-2 ring-orange-500/20 shadow-lg"
                  initialsClassName="text-2xl"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-xl leading-tight">{user.name}</h3>
                <span className="text-xs font-semibold text-orange-600 bg-orange-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer relative
                  ${activeView === item.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                    : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}
                `}
              >
                <item.icon size={22} strokeWidth={activeView === item.id ? 2.5 : 2} />
                <span className="font-bold text-base flex-1">{item.label}</span>
                {activeView === item.id && (
                  <div
                    className="absolute right-5 w-2 h-2 bg-white rounded-full"
                  />
                )}
                {activeView !== item.id && (
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-6 border-t border-gray-100/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-bold transition-all duration-300 text-base hover:bg-red-50"
            >
              <LogOut size={22} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
