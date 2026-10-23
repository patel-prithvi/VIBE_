import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = auth.isAuthenticated();
  const currentUser = auth.getCurrentUser();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  const roleMapping = {
    'student': 'student',
    'faculty': 'faculty',
    'industry expert': 'industry',
    'industry': 'industry',
    'company': 'industry',
  };
  const effectiveRole =
    currentUser?.role ||
    roleMapping[currentUser?.accountType] ||
    currentUser?.accountType;

  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    // Redirect to home if user role is not allowed
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
