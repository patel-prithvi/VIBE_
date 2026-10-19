
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PWAInstaller from './components/PWAInstaller';
import PWAStatus from './components/PWAStatus';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import Login from './pages/Login';
import SignupSelection from './pages/SignupSelection';
import Signup from './pages/StudentSignup'; // Renamed internally for cleaner routing logic
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import PublicProfilePage from './pages/PublicProfilePage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import { useEffect } from 'react';
import { registerServiceWorker } from './utils/pwa';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const location = useLocation();

  // Check if current route is a dashboard, profile, or task route
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/task');
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <PWAStatus />
        {/* Only show Navbar and Footer on non-dashboard routes */}
        {!isDashboardRoute && <Navbar />}
        <main className={isDashboardRoute ? '' : isLoginPage ? 'flex-grow-0 lg:flex-grow' : 'flex-grow'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignupSelection />} />
            <Route path="/signup/student" element={<Signup />} />
            <Route path="/signup/faculty" element={<Signup />} />
            <Route path="/signup/industry" element={<Signup />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/industry"
              element={
                <ProtectedRoute allowedRoles={['industry']}>
                  <IndustryDashboard />
                </ProtectedRoute>
              }
            />

            {/* Public Profile Route for Authorized Users */}
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <PublicProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Task Details Routes */}
            <Route
              path="/tasks/:taskId"
              element={
                <ProtectedRoute>
                  <TaskDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:taskId"
              element={
                <ProtectedRoute>
                  <TaskDetailsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {!isDashboardRoute && <Footer />}
        <PWAInstaller />
      </div>
    </>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Router>
  );
};

export default AppWrapper;
