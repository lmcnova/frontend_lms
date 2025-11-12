import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Badge, LoadingSpinner } from '../../components/common';
import { progressAPI, courseAPI, assignmentAPI } from '../../api';
import { BookOpen, Clock, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentProgress() {
  const [progress, setProgress] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    totalHours: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      // Get progress
      const progressRes = await progressAPI.getMy();
      const progressData = progressRes.data || [];
      setProgress(progressData);

      // Get assigned courses
      const assignmentsRes = await assignmentAPI.getMy();
      const assignments = assignmentsRes.data || [];

      // Load course details
      const coursesMap = {};
      for (const assignment of assignments) {
        try {
          const courseRes = await courseAPI.getById(assignment.course_uuid);
          coursesMap[assignment.course_uuid] = courseRes.data;
        } catch (error) {
          console.error('Failed to load course:', error);
        }
      }
      setCourses(coursesMap);

      // Calculate stats
      const totalCourses = assignments.length;
      const inProgress = progressData.filter(p => p.progress_percent > 0 && p.progress_percent < 100).length;
      const completed = progressData.filter(p => p.progress_percent === 100).length;
      const totalHours = progressData.reduce((sum, p) => sum + (p.learning_hours || 0), 0);
      const averageProgress = totalCourses > 0
        ? progressData.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / totalCourses
        : 0;

      setStats({
        totalCourses,
        inProgress,
        completed,
        totalHours,
        averageProgress,
      });
    } catch (error) {
      toast.error('Failed to load progress');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading your progress..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Progress
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your learning journey across all courses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.inProgress}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.completed}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalHours.toFixed(1)}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Learning Hours</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.averageProgress.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Details */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Course Progress Details
          </h2>

          {progress.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No progress data yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Start watching courses to track your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress
                .sort((a, b) => b.progress_percent - a.progress_percent)
                .map((prog) => {
                  const course = courses[prog.course_uuid];
                  if (!course) return null;

                  const progressPercent = prog.progress_percent || 0;
                  const isCompleted = progressPercent === 100;

                  return (
                    <Link
                      key={prog.uuid_id}
                      to={`/student/courses/${prog.course_uuid}`}
                      className="block"
                    >
                      <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {course.title}
                              </h3>
                              {isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge variant="primary" size="sm">
                                {course.level}
                              </Badge>
                              <Badge variant="secondary" size="sm">
                                {course.category}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {progressPercent}%
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {prog.learning_hours?.toFixed(1) || 0}h watched
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-bar mb-3">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Additional Stats */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={16} />
                            <span>
                              {prog.completed_videos?.length || 0} / {course.total_videos || 0} videos completed
                            </span>
                          </div>
                          {prog.last_watched_at && (
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>
                                Last watched: {new Date(prog.last_watched_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </Card>

        {/* Learning Streak (Optional - placeholder for future feature) */}
        {stats.totalCourses > 0 && (
          <Card>
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Keep Learning!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're making great progress. Keep up the momentum!
              </p>
              <div className="mt-4 flex justify-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-primary-600">{stats.completed}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Courses Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary-600">{stats.totalHours.toFixed(0)}h</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Watch Time</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
