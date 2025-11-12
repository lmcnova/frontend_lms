import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Theme Store
 * Manages dark/light theme preference
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'dark', // 'light' | 'dark'

      // Actions
      setTheme: (theme) => {
        set({ theme });
        updateDOMTheme(theme);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        updateDOMTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        updateDOMTheme(theme);
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
    }
  )
);

/**
 * Update DOM to reflect theme
 */
function updateDOMTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
