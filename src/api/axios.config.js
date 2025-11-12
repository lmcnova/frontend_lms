import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add device name if available
    const deviceName = getDeviceName();
    if (deviceName) {
      config.headers['X-Device-Name'] = deviceName;
    }

    // Handle FormData - let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers['Content-Type'];
    }

    // Debug logging for course and video creation
    if ((config.url?.includes('/courses') || config.url?.includes('/videos') || config.url?.includes('/topics'))
        && (config.method === 'post' || config.method === 'put')) {
      console.log('=== AXIOS REQUEST ===');
      console.log('URL:', config.baseURL + config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Data type:', config.data instanceof FormData ? 'FormData' : typeof config.data);

      if (config.data instanceof FormData) {
        console.log('FormData entries:');
        for (let [key, value] of config.data.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      } else if (typeof config.data === 'string') {
        console.log('Data is already stringified:', config.data);
        console.log('Parsed back:', JSON.parse(config.data));
      } else {
        console.log('Data as JSON:', JSON.stringify(config.data));
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.detail);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', data.detail);
          break;

        case 500:
          // Server error
          console.error('Server error:', data.detail);
          break;

        default:
          console.error('API error:', data.detail || 'An error occurred');
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data.detail || 'An error occurred',
        data,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null,
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        data: null,
      });
    }
  }
);

/**
 * Get device name for session tracking
 */
function getDeviceName() {
  const ua = navigator.userAgent;
  let device = 'Unknown Device';

  // Detect device type
  if (/Android/i.test(ua)) {
    device = 'Android Device';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    device = 'iOS Device';
  } else if (/Windows/i.test(ua)) {
    device = 'Windows PC';
  } else if (/Mac/i.test(ua)) {
    device = 'Mac';
  } else if (/Linux/i.test(ua)) {
    device = 'Linux PC';
  }

  // Try to get more specific browser info
  let browser = '';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg/i.test(ua)) {
    browser = 'Edge';
  }

  return browser ? `${device} - ${browser}` : device;
}

export default api;
