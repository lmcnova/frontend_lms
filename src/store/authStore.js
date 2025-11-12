import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';
import { authAPI } from '../api';
import { getRoleFromToken, isTokenExpired } from '../utils/jwt';

/**
 * Authentication Store
 * Manages user authentication state, token, and user data
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          console.log('📥 Raw API response:', response);

          // Axios returns data in response.data
          const responseData = response.data;
          console.log('📦 Response data:', responseData);

          const { access_token, user_data } = responseData;

          if (!access_token) {
            throw new Error('Invalid response from server - missing token');
          }

          console.log('🔑 Token received (first 30 chars):', access_token?.substring(0, 30) + '...');

          // Extract role from JWT token
          const roleFromToken = getRoleFromToken(access_token);
          console.log('👤 Role extracted from token:', roleFromToken);

          if (!roleFromToken) {
            throw new Error('Could not extract role from token');
          }

          // Store token and user data with role
          localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
          const userWithRole = { ...user_data, role: roleFromToken };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithRole));

          set({
            user: userWithRole,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('✅ Auth state updated successfully');
          console.log('👤 User with role:', userWithRole);

          return { success: true, role: roleFromToken, user: userWithRole };
        } catch (error) {
          console.error('❌ Login error:', error);
          const errorMessage = error?.message || 'Login failed. Please check your credentials.';
          set({
            error: errorMessage,
            isLoading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state regardless of API call result
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      logoutAll: async () => {
        try {
          await authAPI.logoutAll();
        } catch (error) {
          console.error('Logout all error:', error);
        } finally {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Initialize auth from local storage
      initializeAuth: () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (token) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log('Token expired, clearing auth');
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return;
          }

          try {
            let user = userStr ? JSON.parse(userStr) : {};

            // If user doesn't have role, try to get it from token
            if (!user.role && token) {
              const roleFromToken = getRoleFromToken(token);
              if (roleFromToken) {
                user.role = roleFromToken;
                // Update localStorage with role
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
              }
            }

            console.log('Initializing auth with user:', user);

            set({
              user,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      },

      // Update user data
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Get user role
      getRole: () => get().user?.role,

      // Check if user has specific role
      hasRole: (role) => get().user?.role === role,

      // Check if user has any of the specified roles
      hasAnyRole: (roles) => roles.includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
