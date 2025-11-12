import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  UserCog,
  Building2,
  PlayCircle,
  MessageSquare,
  BarChart3,
  Award,
  Settings,
  Smartphone,
} from 'lucide-react';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Students', path: '/admin/students' },
  { icon: UserCog, label: 'Teachers', path: '/admin/teachers' },
  { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
  { icon: Building2, label: 'Departments', path: '/admin/departments' },
  { icon: Award, label: 'Certificates', path: '/admin/certificates' },
  { icon: Smartphone, label: 'Device Requests', path: '/admin/device-requests' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const teacherMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
  { icon: BookOpen, label: 'My Courses', path: '/teacher/courses' },
  { icon: Users, label: 'Students', path: '/teacher/students' },
  { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
  { icon: Settings, label: 'Settings', path: '/teacher/settings' },
];

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
  { icon: BookOpen, label: 'My Courses', path: '/student/courses' },
  { icon: BarChart3, label: 'Progress', path: '/student/progress' },
  { icon: Award, label: 'Certificates', path: '/student/certificates' },
  { icon: Settings, label: 'Settings', path: '/student/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();

  const menuItems =
    user?.role === 'admin'
      ? adminMenuItems
      : user?.role === 'teacher'
      ? teacherMenuItems
      : studentMenuItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {user?.role} Portal
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'sidebar-link',
                  isActive && 'sidebar-link-active'
                )
              }
              onClick={onClose}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>Online Course Management</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
