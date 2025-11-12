import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Badge, Button } from '../../components/common';
import { useAuthStore } from '../../store';
import { courseAPI } from '../../api';
import {
  BookOpen,
  Users,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  Video,
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);

  const stats = [
    {
      label: 'My Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Total Students',
      value: 0,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Total Videos',
      value: courses.reduce((acc, c) => acc + (c.total_videos || 0), 0),
      icon: Video,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Comments',
      value: courses.reduce((acc, c) => acc + (c.total_comments || 0), 0),
      icon: MessageSquare,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your courses and track student progress
            </p>
          </div>
          <Button
            leftIcon={<PlusCircle size={20} />}
            onClick={() => navigate('/teacher/courses')}
          >
            Create New Course
          </Button>
        </div>

        {/* Stats */}
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

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/teacher/courses')}
              className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors text-center"
            >
              <PlusCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Create Course</p>
            </button>
            <button
              onClick={() => navigate('/teacher/courses')}
              className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors text-center"
            >
              <BookOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">My Courses</p>
            </button>
            <button
              onClick={() => navigate('/teacher/courses')}
              className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors text-center"
            >
              <Video className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Manage Content</p>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
