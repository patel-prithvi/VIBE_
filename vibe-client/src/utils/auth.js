import api from '../services/api.js';

export const auth = {
  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('vibe_user') !== null;
  },

  // Get current user from local storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('vibe_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Fetch user from backend (async) and update local storage
  fetchUser: async () => {
    try {
      const response = await api.get('/users/me');
      const user = response.data.data;
      
      // Normalize role from accountType
      const roleMapping = {
          'student': 'student',
          'faculty': 'faculty',
          'industry expert': 'industry'
      };
      if (user.accountType) {
        user.role = roleMapping[user.accountType] || user.accountType;
      }

      localStorage.setItem('vibe_user', JSON.stringify(user));
      return user;
    } catch (error) {
      localStorage.removeItem('vibe_user');
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      const updatedUser = response.data.data;
      
      // Normalize role from accountType
      const roleMapping = {
          'student': 'student',
          'faculty': 'faculty',
          'industry expert': 'industry'
      };
      if (updatedUser.accountType) {
        updatedUser.role = roleMapping[updatedUser.accountType] || updatedUser.accountType;
      }

      localStorage.setItem('vibe_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Update profile failed", error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      // Backend returns: { data: { user: accessToken, refreshToken, loggedInUser: {...} }, ... }
      const { user: accessToken, refreshToken, loggedInUser } = response.data.data;

      // Normalize role from accountType
      const roleMapping = {
          'student': 'student',
          'faculty': 'faculty',
          'industry expert': 'industry'
      };
      if (loggedInUser.accountType) {
        loggedInUser.role = roleMapping[loggedInUser.accountType] || loggedInUser.accountType;
      }

      localStorage.setItem('vibe_user', JSON.stringify(loggedInUser));
      if (accessToken) localStorage.setItem('vibe_access_token', accessToken);
      if (refreshToken) localStorage.setItem('vibe_refresh_token', refreshToken);
      return true;
    } catch (error) {
      const message =
        (error.response && error.response.data && (error.response.data.message || error.response.data.error)) ||
        error.message ||
        "Login failed";
      throw new Error(message);
    }
  },

  // Signup user (Verify OTP)
  signup: async (userData) => {
    try {
      // Step 4 of signup calls this to verify OTP
      const response = await api.post('/users/verify-otp', userData);
      return response.data;
    } catch (error) {
      console.error("Signup failed", error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
        await api.post('/users/logout');
    } catch (e) {
        console.error("Logout failed", e);
    } finally {
        localStorage.removeItem('vibe_user');
        localStorage.removeItem('vibe_access_token');
        localStorage.removeItem('vibe_refresh_token');
    }
  }
};
