import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

// Login schema
export const loginSchema = z.object({
  email_id: emailSchema,
  password: passwordSchema,
});

// Admin registration schema
export const adminRegisterSchema = z.object({
  college_name: z.string().min(1, 'College name is required').max(200),
  email_id: emailSchema,
  total_student_allow_count: z.number().min(0, 'Must be 0 or greater').int(),
  password: passwordSchema,
});

// Student registration schema
export const studentRegisterSchema = z.object({
  student_name: z.string().min(1, 'Student name is required').max(200),
  department: z.string().min(1, 'Department is required').max(100),
  email_id: emailSchema,
  sub_department: z.string().max(100).optional(),
  admin_uuid_id: z.string().uuid('Invalid admin ID'),
  password: passwordSchema,
});

// Teacher creation schema
export const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  email_id: emailSchema,
  bio: z.string().optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  password: passwordSchema,
});

// Department schema
export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(200),
  code: z.string().min(1, 'Department code is required').max(20),
  description: z.string().optional(),
  admin_uuid_id: z.string().uuid('Invalid admin ID'),
});

// Course creation schema
export const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  category: z.string().min(1, 'Category is required').max(50),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Invalid level' }),
  }),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  intro_video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instructor_uuid: z.string().uuid('Invalid instructor ID'),
  co_instructor_uuids: z.array(z.string().uuid()).optional(),
});

// Topic creation schema
export const topicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  order_index: z.number().int().min(1).optional(),
});

// Video creation schema
export const videoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  video_url: z.string().url('Invalid video URL').or(z.string().min(1)),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  duration_seconds: z.number().min(0, 'Duration must be positive').int(),
  is_preview: z.boolean().optional(),
  order_index: z.number().int().min(1).optional(),
});

// Comment creation schema
export const commentSchema = z.object({
  parent_type: z.enum(['topic', 'video']),
  parent_uuid: z.string().uuid('Invalid parent ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

// Assignment creation schema
export const assignmentSchema = z.object({
  course_uuid: z.string().uuid('Invalid course ID'),
  student_uuid: z.string().uuid('Invalid student ID').optional(),
  student_uuids: z.array(z.string().uuid('Invalid student ID')).optional(),
});

// Video progress schema
export const videoProgressSchema = z.object({
  last_position_sec: z.number().min(0).int(),
  delta_seconds_watched: z.number().min(0).int().optional(),
  completed: z.boolean().optional(),
});

// Device reset request schema
export const deviceResetRequestSchema = z.object({
  reason: z.string().max(500, 'Reason is too long').optional(),
});

/**
 * Validate form data against a schema
 */
export const validateForm = (schema, data) => {
  try {
    schema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email) => {
  return emailSchema.safeParse(email).success;
};

/**
 * Check if password is valid
 */
export const isValidPassword = (password) => {
  return passwordSchema.safeParse(password).success;
};

/**
 * Check if URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
