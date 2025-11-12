import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Badge, LoadingSpinner } from '../../components/common';
import { courseAPI } from '../../api';
import { useAuthStore } from '../../store';
import { Search, Plus, Edit2, Trash2, BookOpen, Play, Users, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherCourses() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // Get all courses and filter by instructor
      const response = await courseAPI.getAll();
      const allCourses = response.data || [];

      // Filter courses where user is instructor or co-instructor
      const myCourses = allCourses.filter((course) => {
        return (
          course.instructor_uuid === user?.uuid_id ||
          course.co_instructor_uuids?.includes(user?.uuid_id)
        );
      });

      setCourses(myCourses);
    } catch (error) {
      toast.error('Failed to load courses');
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
      loadCourses();
    } catch (error) {
      toast.error('Failed to delete course');
      console.error(error);
    }
  };

  const handleCreateCourse = () => {
    navigate('/teacher/courses/create');
  };

  const handleEditCourse = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;

    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading your courses..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Courses
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {courses.length} course{courses.length !== 1 ? 's' : ''} you're teaching
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateCourse}>
            Create Course
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses by title, description, or tags..."
                leftIcon={<Search size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
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
          </div>
        </Card>

        {/* Courses Grid */}
        <Card>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterLevel !== 'all'
                  ? 'No courses found matching your filters'
                  : 'No courses yet'}
              </p>
              {!searchTerm && filterLevel === 'all' && (
                <Button className="mt-4" onClick={handleCreateCourse} leftIcon={<Plus size={18} />}>
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const levelColors = {
                  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                };

                const isMainInstructor = course.instructor_uuid === user?.uuid_id;

                return (
                  <div
                    key={course.uuid_id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center relative">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-white" />
                      )}
                      {!isMainInstructor && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" size="sm">
                            Co-Instructor
                          </Badge>
                        </div>
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

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Play size={16} />
                          <span>{course.total_videos || 0} videos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{course.enrolled_count || 0} students</span>
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

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCourse(course.uuid_id)}
                          leftIcon={<Eye size={16} />}
                          className="flex-1"
                        >
                          View
                        </Button>
                        {isMainInstructor && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCourse(course.uuid_id)}
                              leftIcon={<Edit2 size={16} />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.uuid_id)}
                              leftIcon={<Trash2 size={16} />}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Stats Summary */}
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
                  {courses.reduce((sum, c) => sum + (c.total_videos || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.filter(c => c.instructor_uuid === user?.uuid_id).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">As Main Instructor</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
