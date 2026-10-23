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

  // Helper to normalize user role from accountType
  normalizeUser: (user) => {
    if (!user) return null;
    const cloned = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    const roleMapping = {
      'student': 'student',
      'faculty': 'faculty',
      'industry expert': 'industry',
      'industry': 'industry',
      'company': 'industry',
    };
    if (cloned.accountType || cloned.role) {
      cloned.role = roleMapping[cloned.accountType] || cloned.role || cloned.accountType;
    }
    return cloned;
  },

  // Helper to update session in localStorage
  setUserSession: (user, accessToken = null, refreshToken = null) => {
    if (!user) return null;
    const normalized = auth.normalizeUser(user);
    localStorage.setItem('vibe_user', JSON.stringify(normalized));
    if (accessToken) localStorage.setItem('vibe_access_token', accessToken);
    if (refreshToken) localStorage.setItem('vibe_refresh_token', refreshToken);
    return normalized;
  },

  // Fetch user from backend (async) and update local storage
  fetchUser: async () => {
    try {
      const response = await api.get('/users/me');
      const user = response.data.data;
      return auth.setUserSession(user);
    } catch (error) {
      // ONLY clear session if server explicitly returns 401 Unauthorized.
      // Never wipe user session on network glitches, 503 DB reconnects, or server restarts!
      if (error.response?.status === 401) {
        localStorage.removeItem('vibe_user');
        localStorage.removeItem('vibe_access_token');
        localStorage.removeItem('vibe_refresh_token');
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      const updatedUser = response.data.data;
      return auth.setUserSession(updatedUser);
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
      auth.setUserSession(loggedInUser, accessToken, refreshToken);
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
  },

  // Forgot Password - Request OTP to email
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && (error.response.data.message || error.response.data.error)) ||
        error.message ||
        "Failed to send verification code";
      throw new Error(message);
    }
  },

  // Verify Reset OTP
  verifyResetOtp: async (email, otp) => {
    try {
      const response = await api.post('/users/verify-reset-otp', { email, otp });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && (error.response.data.message || error.response.data.error)) ||
        error.message ||
        "Invalid verification code";
      throw new Error(message);
    }
  },

  // Reset Password - Submit OTP and New Password
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/users/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && (error.response.data.message || error.response.data.error)) ||
        error.message ||
        "Failed to reset password";
      throw new Error(message);
    }
  }
};
