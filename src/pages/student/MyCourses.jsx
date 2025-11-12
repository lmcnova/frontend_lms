import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Badge, Button, LoadingSpinner } from '../../components/common';
import { assignmentAPI, courseAPI, progressAPI } from '../../api';
import { BookOpen, Play, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentMyCourses() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // Get assigned courses
      const assignmentsRes = await assignmentAPI.getMy();
      const assignments = assignmentsRes.data || [];

      // Get course details for each assignment
      const coursePromises = assignments.map(async (assignment) => {
        try {
          const courseRes = await courseAPI.getById(assignment.course_uuid);
          return courseRes.data;
        } catch (error) {
          console.error('Failed to load course:', error);
          return null;
        }
      });

      const coursesData = (await Promise.all(coursePromises)).filter(Boolean);
      setCourses(coursesData);

      // Get progress for courses
      const progressRes = await progressAPI.getMy();
      const progressData = {};
      (progressRes.data || []).forEach((p) => {
        progressData[p.course_uuid] = p;
      });
      setProgress(progressData);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Courses
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {courses.length} course{courses.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No courses assigned yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Contact your instructor or admin to get courses assigned
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const courseProgress = progress[course.uuid_id];
              const progressPercent = courseProgress?.progress_percent || 0;
              const isCompleted = progressPercent === 100;

              return (
                <Link key={course.uuid_id} to={`/student/courses/${course.uuid_id}`}>
                  <Card hover className="h-full">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-t-lg mb-4 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                            {course.title}
                          </h3>
                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
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
                        {courseProgress && (
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{courseProgress.learning_hours?.toFixed(1) || 0}h</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="primary" size="sm">
                          {course.level}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {course.category}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
