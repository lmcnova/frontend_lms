import { jwtDecode } from 'jwt-decode';

/**
 * Decode JWT token and extract payload
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get role from JWT token
 */
export const getRoleFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error('Failed to get role from token:', error);
    return null;
  }
};

/**
 * Get user UUID from JWT token
 */
export const getUserUuidFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.uuid || decoded.sub || null;
  } catch (error) {
    console.error('Failed to get UUID from token:', error);
    return null;
  }
};
