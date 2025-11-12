import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Select, MultiSelect, FileUpload, Modal, Badge, LoadingSpinner, Avatar } from '../../components/common';
import { courseAPI, teacherAPI, departmentAPI } from '../../api';
import { Search, Plus, Edit2, Trash2, BookOpen, Play, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [teachersList, setTeachersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load courses
      const coursesRes = await courseAPI.getAll();
      const coursesData = coursesRes.data || [];
      setCourses(coursesData);

      // Load all teachers to show instructor names
      const teachersRes = await teacherAPI.getAll();
      const teachersData = teachersRes.data || [];
      setTeachersList(teachersData);
      const teachersMap = {};
      teachersData.forEach((t) => {
        teachersMap[t.uuid_id] = t;
      });
      setTeachers(teachersMap);

      // Load departments
      const departmentsRes = await departmentAPI.getAll();
      setDepartments(departmentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    try {
      await courseAPI.delete(courseId);
      toast.success('Course deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete course');
      console.error(error);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setSelectedDepartments([]);
    setThumbnailFile(null);
    setIntroVideoFile(null);
    reset({
      title: '',
      description: '',
      instructor_uuid: '', // Will be validated by react-hook-form
      level: 'beginner',
      category: '',
      tags: '',
      auto_assign: false,
    });
    setIsModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setSelectedDepartments(Array.isArray(course.departments) ? course.departments : []);
    setThumbnailFile(course.thumbnail_url || null);
    setIntroVideoFile(course.intro_video_url || null);
    reset({
      title: course.title,
      description: course.description,
      instructor_uuid: course.instructor_uuid,
      level: course.level,
      category: course.category,
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      auto_assign: course.auto_assign || false,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      console.log('=== FORM SUBMISSION START ===');
      console.log('Form data:', data);
      console.log('Selected departments:', selectedDepartments);
      console.log('Thumbnail file:', thumbnailFile);
      console.log('Intro video file:', introVideoFile);

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Build course object (will be sent as JSON string in form field)
      const courseData = {
        title: data.title.trim(),
        description: data.description.trim(),
        instructor_uuid: data.instructor_uuid,
        category: data.category.trim(),
        level: data.level,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        departments: selectedDepartments || [],
        auto_assign: Boolean(data.auto_assign),
        co_instructor_uuids: [],
      };

      // Add course data as JSON string to form
      formData.append('course', JSON.stringify(courseData));

      // Add thumbnail file if it exists and is a File object
      if (thumbnailFile && thumbnailFile instanceof File) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Add intro video file if it exists and is a File object
      if (introVideoFile && introVideoFile instanceof File) {
        formData.append('intro_video', introVideoFile);
      }

      console.log('Final FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      let response;
      if (editingCourse) {
        console.log('Updating course:', editingCourse.uuid_id);
        response = await courseAPI.update(editingCourse.uuid_id, formData);
        toast.success('Course updated successfully');
      } else {
        console.log('Creating new course...');
        response = await courseAPI.create(formData);
        console.log('Create response:', response);
        toast.success('Course created successfully');
      }

      setIsModalOpen(false);
      setSelectedDepartments([]);
      setThumbnailFile(null);
      setIntroVideoFile(null);
      loadData();
      console.log('=== FORM SUBMISSION SUCCESS ===');
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
          : error.response.data.detail)
        : (error.message || 'Operation failed');

      toast.error(errorMessage);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading courses..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      
      <div className="space-y-6">

        {/* Summary Stats */}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Courses Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage all courses in the system
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateCourse}>
            Create Course
          </Button>
        </div>


        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.filter(c => c.level === 'beginner').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Beginner</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.filter(c => c.level === 'intermediate').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Intermediate</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.filter(c => c.level === 'advanced').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Advanced</p>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            <Input
              placeholder="Search courses by title, description, or tags..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="input-base"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-base"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Courses Grid */}
        <Card>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterLevel !== 'all' || filterCategory !== 'all'
                  ? 'No courses found matching your filters'
                  : 'No courses yet'}
              </p>
              {!searchTerm && filterLevel === 'all' && filterCategory === 'all' && (
                <Button className="mt-4" onClick={handleCreateCourse} leftIcon={<Plus size={18} />}>
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const instructor = teachers[course.instructor_uuid];
                const levelColors = {
                  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                };

                return (
                  <div
                    key={course.uuid_id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {course.description || 'No description available'}
                        </p>
                      </div>

                      {/* Instructor */}
                      {instructor && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={instructor.avatar_url}
                            name={instructor.name}
                            size="sm"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {instructor.name}
                          </span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Play size={16} />
                          <span>{course.total_videos || 0} videos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{course.enrolled_count || 0} enrolled</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${levelColors[course.level] || 'bg-gray-100 text-gray-800'}`}>
                          {course.level}
                        </span>
                        <Badge variant="secondary" size="sm">
                          {course.category}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {course.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              +{course.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Departments */}
                      {course.departments && course.departments.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Departments:</span> {course.departments.join(', ')}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${course.uuid_id}/topics`)}
                          leftIcon={<BookOpen size={16} />}
                          className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Topics
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                          leftIcon={<Edit2 size={16} />}
                          className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.uuid_id)}
                          leftIcon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <BookOpen className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingCourse ? 'Update course information' : 'Add a new course to the platform'}
                </p>
              </div>
            </div>
          }
          size="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Basic Information
                </h4>
              </div>

              <Input
                label="Course Title"
                {...register('title', {
                  required: 'Title is required',
                  validate: value => value.trim() !== '' || 'Title cannot be empty'
                })}
                error={errors.title?.message}
                placeholder="e.g., Introduction to React Development"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    validate: value => value.trim() !== '' || 'Description cannot be empty'
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                  placeholder="Provide a detailed description of what students will learn..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Category"
                  {...register('category', {
                    required: 'Category is required',
                    validate: value => value.trim() !== '' || 'Category cannot be empty'
                  })}
                  error={errors.category?.message}
                  placeholder="e.g., Web Development"
                />

                <Select
                  label="Level"
                  {...register('level', {
                    required: 'Level is required',
                    validate: value => value !== '' || 'Please select a level'
                  })}
                  error={errors.level?.message}
                  placeholder="Select level"
                  options={[
                    { value: 'beginner', label: '🟢 Beginner' },
                    { value: 'intermediate', label: '🟡 Intermediate' },
                    { value: 'advanced', label: '🔴 Advanced' },
                  ]}
                />
              </div>

              <Input
                label="Tags"
                {...register('tags')}
                placeholder="react, javascript, frontend, web"
                helperText="Comma-separated tags for better searchability"
              />
            </div>

            {/* Assignment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-secondary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Instructor & Departments
                </h4>
              </div>

              <Select
                label="Instructor"
                {...register('instructor_uuid', {
                  required: 'Instructor is required',
                  validate: value => value !== '' || 'Please select an instructor'
                })}
                error={errors.instructor_uuid?.message}
                placeholder="Select instructor for this course"
                options={teachersList.map((teacher) => ({
                  value: teacher.uuid_id,
                  label: teacher.name,
                }))}
              />

              <MultiSelect
                label="Departments"
                value={selectedDepartments}
                onChange={setSelectedDepartments}
                placeholder="Select departments"
                options={departments.map((dept) => ({
                  value: dept.name,
                  label: dept.name,
                }))}
                helperText="Select departments that can access this course"
              />

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <input
                  type="checkbox"
                  id="auto_assign"
                  {...register('auto_assign')}
                  className="mt-0.5 w-4 h-4 text-primary-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="auto_assign" className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Auto-assign to students
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Automatically enroll existing students from selected departments
                  </p>
                </label>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-accent-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Media Assets
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label="Course Thumbnail"
                  type="image"
                  accept="image/*"
                  value={thumbnailFile}
                  onChange={setThumbnailFile}
                  helperText="PNG, JPG up to 2MB"
                />

                <FileUpload
                  label="Intro Video"
                  type="video"
                  accept="video/*"
                  value={introVideoFile}
                  onChange={setIntroVideoFile}
                  helperText="MP4, WebM up to 50MB"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
