import api from './axios.config';
import { ENDPOINTS } from '../utils/constants';

/**
 * Complete API Service Layer
 * All API calls in one place for easy maintenance
 */

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) => api.post(ENDPOINTS.LOGIN, credentials),
  logout: () => api.post(ENDPOINTS.LOGOUT),
  logoutAll: () => api.post(ENDPOINTS.LOGOUT_ALL),
  getSessions: () => api.get(ENDPOINTS.SESSIONS),
};

// ==================== ADMIN ====================
export const adminAPI = {
  create: (data) => api.post(ENDPOINTS.ADMIN, data),
  getAll: () => api.get(ENDPOINTS.ADMIN),
  getById: (id) => api.get(ENDPOINTS.ADMIN_BY_ID(id)),
  update: (id, data) => api.put(ENDPOINTS.ADMIN_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.ADMIN_BY_ID(id)),
};

// ==================== STUDENT ====================
export const studentAPI = {
  create: (data) => api.post(ENDPOINTS.STUDENT, data),
  getAll: () => api.get(ENDPOINTS.STUDENT),
  getById: (id) => api.get(ENDPOINTS.STUDENT_BY_ID(id)),
  update: (id, data) => api.put(ENDPOINTS.STUDENT_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.STUDENT_BY_ID(id)),
};

// ==================== TEACHER ====================
export const teacherAPI = {
  create: (data) => api.post(ENDPOINTS.TEACHER, data),
  getAll: () => api.get(ENDPOINTS.TEACHER),
  getById: (id) => api.get(ENDPOINTS.TEACHER_BY_ID(id)),
  update: (id, data) => api.put(ENDPOINTS.TEACHER_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.TEACHER_BY_ID(id)),
};

// ==================== DEPARTMENT ====================
export const departmentAPI = {
  create: (data) => api.post(ENDPOINTS.DEPARTMENT, data),
  getAll: () => api.get(ENDPOINTS.DEPARTMENT),
  getById: (id) => api.get(ENDPOINTS.DEPARTMENT_BY_ID(id)),
  update: (id, data) => api.put(ENDPOINTS.DEPARTMENT_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.DEPARTMENT_BY_ID(id)),
};

// ==================== COURSE ====================
export const courseAPI = {
  create: (data) => api.post(ENDPOINTS.COURSE, data),
  getAll: (params) => api.get(ENDPOINTS.COURSE, { params }),
  getById: (id) => api.get(ENDPOINTS.COURSE_BY_ID(id)),
  getOutline: (id) => api.get(ENDPOINTS.COURSE_OUTLINE(id)),
  update: (id, data) => api.put(ENDPOINTS.COURSE_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.COURSE_BY_ID(id)),
};

// ==================== TOPIC ====================
export const topicAPI = {
  getByCourse: (courseId) => api.get(ENDPOINTS.TOPIC_BY_COURSE(courseId)),
  create: (courseId, data) => api.post(ENDPOINTS.TOPIC_CREATE(courseId), data),
  update: (id, data) => api.put(ENDPOINTS.TOPIC_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.TOPIC_BY_ID(id)),
};

// ==================== VIDEO ====================
export const videoAPI = {
  getByTopic: (topicId) => api.get(ENDPOINTS.VIDEO_BY_TOPIC(topicId)),
  create: (topicId, data) => api.post(ENDPOINTS.VIDEO_CREATE(topicId), data),
  getById: (id) => api.get(ENDPOINTS.VIDEO_BY_ID(id)),
  update: (id, data) => api.put(ENDPOINTS.VIDEO_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.VIDEO_BY_ID(id)),
};

// ==================== COMMENT ====================
export const commentAPI = {
  create: (data) => api.post(ENDPOINTS.COMMENT, data),
  getByTopic: (topicId) => api.get(ENDPOINTS.COMMENT_BY_TOPIC(topicId)),
  getByVideo: (videoId) => api.get(ENDPOINTS.COMMENT_BY_VIDEO(videoId)),
  update: (id, data) => api.put(ENDPOINTS.COMMENT_BY_ID(id), data),
  delete: (id) => api.delete(ENDPOINTS.COMMENT_BY_ID(id)),
};

// ==================== ASSIGNMENT ====================
export const assignmentAPI = {
  create: (data) => api.post(ENDPOINTS.ASSIGNMENT, data),
  getAll: (params) => api.get(ENDPOINTS.ASSIGNMENT, { params }),
  getMy: () => api.get(ENDPOINTS.ASSIGNMENT_ME),
  revoke: (id) => api.delete(ENDPOINTS.ASSIGNMENT_BY_ID(id)),
};

// ==================== PROGRESS ====================
export const progressAPI = {
  updateVideo: (videoId, data) => api.put(ENDPOINTS.PROGRESS_VIDEO(videoId), data),
  trackEvent: (videoId, data) => api.post(ENDPOINTS.PROGRESS_VIDEO_EVENTS(videoId), data),
  markComplete: (videoId) => api.post(ENDPOINTS.PROGRESS_VIDEO_COMPLETE(videoId)),
  getCourse: (courseId) => api.get(ENDPOINTS.PROGRESS_COURSE(courseId)),
  getMy: () => api.get(ENDPOINTS.PROGRESS_ME),
  getAppreciation: (courseId) => api.get(ENDPOINTS.PROGRESS_APPRECIATION(courseId)),
  setAppreciation: (studentId, courseId) =>
    api.post(ENDPOINTS.PROGRESS_SET_APPRECIATION(studentId, courseId)),
};

// ==================== CERTIFICATE ====================
export const certificateAPI = {
  // Legacy endpoints (keep for backward compatibility)
  getStatus: (courseId) => api.get(ENDPOINTS.CERTIFICATE_STATUS(courseId)),
  adminIssue: (studentId, courseId) =>
    api.post(ENDPOINTS.CERTIFICATE_ADMIN_ISSUE(studentId, courseId)),

  // Student endpoints
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  checkEligibility: (courseId) => api.get(`/certificates/course/${courseId}/eligibility`),
  claimCertificate: (courseId) => api.post(`/certificates/course/${courseId}/claim`),

  // Public endpoint
  verify: (code) => api.get(`/certificates/verify/${code}`),

  // Admin endpoints
  getAll: (params) => api.get('/certificates/all', { params }),
  getById: (certificateId) => api.get(`/certificates/${certificateId}`),
  issue: (data) => api.post('/certificates/issue', data),
  update: (certificateId, data) => api.put(`/certificates/${certificateId}`, data),
  upload: (certificateId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/certificates/${certificateId}/upload`, formData);
  },
  revoke: (certificateId) => api.post(`/certificates/${certificateId}/revoke`),
  restore: (certificateId) => api.post(`/certificates/${certificateId}/restore`),
  delete: (certificateId) => api.delete(`/certificates/${certificateId}`),
};

// ==================== MEDIA ====================
export const mediaAPI = {
  getVideoConfig: (videoId) => api.get(ENDPOINTS.MEDIA_VIDEO(videoId)),
};

// ==================== DEVICE ====================
export const deviceAPI = {
  requestReset: (data) => api.post(ENDPOINTS.DEVICE_RESET_REQUEST, data),
  getRequests: (params) => api.get(ENDPOINTS.DEVICE_RESET_REQUESTS, { params }),
  approve: (requestId) => api.post(ENDPOINTS.DEVICE_RESET_APPROVE(requestId)),
  reject: (requestId) => api.post(ENDPOINTS.DEVICE_RESET_REJECT(requestId)),
};

// Export default object with all APIs
export default {
  auth: authAPI,
  admin: adminAPI,
  student: studentAPI,
  teacher: teacherAPI,
  department: departmentAPI,
  course: courseAPI,
  topic: topicAPI,
  video: videoAPI,
  comment: commentAPI,
  assignment: assignmentAPI,
  progress: progressAPI,
  certificate: certificateAPI,
  media: mediaAPI,
  device: deviceAPI,
  certificates: certificateAPI,
};
