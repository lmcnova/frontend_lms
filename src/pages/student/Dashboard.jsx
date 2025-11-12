import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Badge, Button, LoadingSpinner } from '../../components/common';
import { useAuthStore } from '../../store';
import { assignmentAPI, progressAPI } from '../../api';
import {
  BookOpen,
  Play,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [assignmentsRes, progressRes] = await Promise.all([
        assignmentAPI.getMy(),
        progressAPI.getMy(),
      ]);
      setAssignments(assignmentsRes.data || []);
      setProgress(progressRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Enrolled Courses',
      value: assignments.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'In Progress',
      value: progress.filter((p) => p.progress_percent < 100).length,
      icon: Play,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Completed',
      value: progress.filter((p) => p.progress_percent === 100).length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Learning Hours',
      value: progress.reduce((acc, p) => acc + (p.learning_hours || 0), 0).toFixed(1),
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.student_name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="card-hover">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Watching */}
        {progress.filter((p) => p.progress_percent > 0 && p.progress_percent < 100).length > 0 && (
          <Card title="Continue Watching">
            <div className="space-y-4">
              {progress
                .filter((p) => p.progress_percent > 0 && p.progress_percent < 100)
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Course {item.course_uuid.slice(0, 8)}
                      </h4>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${item.progress_percent}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.progress_percent}%
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play size={16} />
                      Continue
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* My Courses */}
        <Card
          title="My Courses"
          subtitle={`${assignments.length} courses assigned`}
          headerAction={
            <Button variant="ghost" size="sm">
              View All <ArrowRight size={16} />
            </Button>
          }
        >
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No courses assigned yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.slice(0, 6).map((assignment, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg mb-3" />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Course {assignment.course_uuid.slice(0, 8)}
                  </h4>
                  <Badge variant="success" size="sm">
                    {assignment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
