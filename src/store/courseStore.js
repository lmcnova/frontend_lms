import { create } from 'zustand';

/**
 * Course Store
 * Manages course-related state and filters
 */
export const useCourseStore = create((set, get) => ({
  // State
  selectedCourse: null,
  courses: [],
  filters: {
    search: '',
    category: '',
    level: '',
    instructor_uuid: '',
  },
  sortBy: 'recent', // 'recent' | 'popular' | 'title'

  // Actions
  setSelectedCourse: (course) => set({ selectedCourse: course }),

  setCourses: (courses) => set({ courses }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearFilters: () => set({
    filters: {
      search: '',
      category: '',
      level: '',
      instructor_uuid: '',
    },
  }),

  setSortBy: (sortBy) => set({ sortBy }),

  // Get filtered courses
  getFilteredCourses: () => {
    const { courses, filters, sortBy } = get();
    let filtered = [...courses];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchLower) ||
        (course.description && course.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((course) => course.category === filters.category);
    }

    // Apply level filter
    if (filters.level) {
      filtered = filtered.filter((course) => course.level === filters.level);
    }

    // Apply instructor filter
    if (filters.instructor_uuid) {
      filtered = filtered.filter((course) => course.instructor_uuid === filters.instructor_uuid);
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.total_comments || 0) - (a.total_comments || 0));
        break;
      case 'recent':
      default:
        // Assuming courses are already sorted by creation date from API
        break;
    }

    return filtered;
  },
}));
