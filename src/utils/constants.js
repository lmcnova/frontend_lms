export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lms.synkeninnovations.in/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Online Course Management';

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

// Assignment Status
export const ASSIGNMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REVOKED: 'revoked',
};

// Comment Status
export const COMMENT_STATUS = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  DELETED: 'deleted',
};

// Device Reset Request Status
export const DEVICE_RESET_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'theme_preference',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout-all',
  SESSIONS: '/auth/sessions',

  // Admin
  ADMIN: '/admin',
  ADMIN_BY_ID: (id) => `/admin/${id}`,

  // Student
  STUDENT: '/student',
  STUDENT_BY_ID: (id) => `/student/${id}`,

  // Teacher
  TEACHER: '/teachers',
  TEACHER_BY_ID: (id) => `/teachers/${id}`,

  // Department
  DEPARTMENT: '/departments',
  DEPARTMENT_BY_ID: (id) => `/departments/${id}`,

  // Course
  COURSE: '/courses',
  COURSE_BY_ID: (id) => `/courses/${id}`,
  COURSE_OUTLINE: (id) => `/courses/${id}/outline`,

  // Topic
  TOPIC_BY_COURSE: (courseId) => `/topics/course/${courseId}`,
  TOPIC_CREATE: (courseId) => `/topics/course/${courseId}`,
  TOPIC_BY_ID: (id) => `/topics/${id}`,

  // Video
  VIDEO_BY_TOPIC: (topicId) => `/videos/topic/${topicId}`,
  VIDEO_CREATE: (topicId) => `/videos/topic/${topicId}`,
  VIDEO_BY_ID: (id) => `/videos/${id}`,

  // Comment
  COMMENT: '/comments',
  COMMENT_BY_TOPIC: (topicId) => `/comments/topic/${topicId}`,
  COMMENT_BY_VIDEO: (videoId) => `/comments/video/${videoId}`,
  COMMENT_BY_ID: (id) => `/comments/${id}`,

  // Assignment
  ASSIGNMENT: '/assignments',
  ASSIGNMENT_ME: '/assignments/me',
  ASSIGNMENT_BY_ID: (id) => `/assignments/${id}`,

  // Progress
  PROGRESS_VIDEO: (videoId) => `/progress/video/${videoId}`,
  PROGRESS_VIDEO_EVENTS: (videoId) => `/progress/video/${videoId}/events`,
  PROGRESS_VIDEO_COMPLETE: (videoId) => `/progress/video/${videoId}/complete`,
  PROGRESS_COURSE: (courseId) => `/progress/course/${courseId}`,
  PROGRESS_ME: '/progress/me',
  PROGRESS_APPRECIATION: (courseId) => `/progress/course/${courseId}/appreciation`,
  PROGRESS_SET_APPRECIATION: (studentId, courseId) => `/progress/course/${studentId}/${courseId}/appreciate`,

  // Certificate
  CERTIFICATE_STATUS: (courseId) => `/certificates/course/${courseId}`,
  CERTIFICATE_ISSUE: (courseId) => `/certificates/course/${courseId}`,
  CERTIFICATE_ADMIN_ISSUE: (studentId, courseId) => `/certificates/admin/issue/${studentId}/${courseId}`,

  // Media
  MEDIA_VIDEO: (videoId) => `/media/video/${videoId}`,

  // Device
  DEVICE_RESET_REQUEST: '/devices/reset-request',
  DEVICE_RESET_REQUESTS: '/devices/reset-requests',
  DEVICE_RESET_APPROVE: (requestId) => `/devices/reset-requests/${requestId}/approve`,
  DEVICE_RESET_REJECT: (requestId) => `/devices/reset-requests/${requestId}/reject`,
};

// Course Categories
export const COURSE_CATEGORIES = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Personal Development',
  'Health & Fitness',
  'Language',
  'Music',
  'Photography',
  'Other',
];

// Pagination
export const ITEMS_PER_PAGE = 12;

// Video Player Settings
export const VIDEO_PROGRESS_SAVE_INTERVAL = 10000; // 10 seconds
export const VIDEO_COMPLETION_THRESHOLD = 0.95; // 95% watched = complete
