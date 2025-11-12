import api from './axios.config';
import { ENDPOINTS } from '../utils/constants';

/**
 * Admin API services
 */

// Create admin
export const createAdmin = async (data) => {
  const response = await api.post(ENDPOINTS.ADMIN, data);
  return response.data;
};

// Get all admins
export const getAdmins = async () => {
  const response = await api.get(ENDPOINTS.ADMIN);
  return response.data;
};

// Get admin by ID
export const getAdminById = async (id) => {
  const response = await api.get(ENDPOINTS.ADMIN_BY_ID(id));
  return response.data;
};

// Update admin
export const updateAdmin = async (id, data) => {
  const response = await api.put(ENDPOINTS.ADMIN_BY_ID(id), data);
  return response.data;
};

// Delete admin
export const deleteAdmin = async (id) => {
  const response = await api.delete(ENDPOINTS.ADMIN_BY_ID(id));
  return response.data;
};

export default {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
