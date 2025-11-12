import api from './axios.config';
import { ENDPOINTS } from '../utils/constants';

/**
 * Authentication API services
 */

// Login
export const login = async (credentials) => {
  const response = await api.post(ENDPOINTS.LOGIN, credentials);
  return response.data;
};

// Logout current session
export const logout = async () => {
  const response = await api.post(ENDPOINTS.LOGOUT);
  return response.data;
};

// Logout all sessions
export const logoutAll = async () => {
  const response = await api.post(ENDPOINTS.LOGOUT_ALL);
  return response.data;
};

// Get all sessions
export const getSessions = async () => {
  const response = await api.get(ENDPOINTS.SESSIONS);
  return response.data;
};

export default {
  login,
  logout,
  logoutAll,
  getSessions,
};
