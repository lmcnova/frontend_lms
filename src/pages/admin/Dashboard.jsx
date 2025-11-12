import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button } from '../../components/common';
import { useAuthStore } from '../../store';
import { studentAPI, teacherAPI, courseAPI } from '../../api';
import {
  Users,
  UserCog,
  BookOpen,
  TrendingUp,
  Activity,
  Building2,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        studentAPI.getAll(),
        teacherAPI.getAll(),
        courseAPI.getAll(),
      ]);
      setStats({
        students: studentsRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0,
        courses: coursesRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Students',
      value: stats.students,
      max: user?.total_student_allow_count || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      link: '/admin/students',
    },
    {
      label: 'Total Teachers',
      value: stats.teachers,
      icon: UserCog,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
      link: '/admin/teachers',
    },
    {
      label: 'Total Courses',
      value: stats.courses,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      link: '/admin/courses',
    },
    {
      label: 'Departments',
      value: 0,
      icon: Building2,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      link: '/admin/departments',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {user?.college_name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your institution from here
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="card-hover cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                    {stat.max && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        / {stat.max}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/admin/students')}
              >
                <Users className="mr-2" size={18} />
                Add New Student
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/admin/teachers')}
              >
                <UserCog className="mr-2" size={18} />
                Add New Teacher
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/admin/departments')}
              >
                <Building2 className="mr-2" size={18} />
                Create Department
              </Button>
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          </Card>
        </div>

        {/* Student Usage */}
        {user?.total_student_allow_count > 0 && (
          <Card title="Student Usage">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.students} of {user.total_student_allow_count} students used
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {((stats.students / user.total_student_allow_count) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar h-4">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(stats.students / user.total_student_allow_count) * 100}%`,
                  }}
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
