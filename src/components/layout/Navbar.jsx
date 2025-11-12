import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../../store';
import { Avatar, Dropdown, DropdownItem, DropdownDivider } from '../common';
import {
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  LogOut,
  Settings,
  User,
  BookOpen,
} from 'lucide-react';
import { APP_NAME } from '../../utils/constants';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [notifications] = useState([]);

  // Get user display name based on role
  const getUserName = () => {
    if (user?.role === 'student') return user.student_name;
    if (user?.role === 'teacher') return user.teacher_name || user.name;
    if (user?.role === 'admin') return user.college_name || user.name;
    return user?.name || 'User';
  };

  const userName = getUserName();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="hidden sm:block text-lg font-bold gradient-text">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Right: Theme toggle + Notifications + User menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications */}
            <Dropdown
              trigger={
                <div className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
              }
              align="right"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <DropdownItem key={idx}>{notif.message}</DropdownItem>
                ))
              )}
            </Dropdown>

            {/* User Menu */}
            {user && (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-1.5 sm:gap-2 p-1 pr-2 sm:pr-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Avatar
                      src={user.avatar_url}
                      name={userName}
                      size="sm"
                    />
                    <div className="hidden sm:block text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] md:max-w-[200px]">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                }
                align="right"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 min-w-[200px] max-w-[280px]">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email_id}
                  </p>
                </div>

                <DropdownItem
                  icon={<User size={16} />}
                  onClick={() => {}}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  icon={<Settings size={16} />}
                  onClick={() => {}}
                >
                  Settings
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  icon={<LogOut size={16} />}
                  onClick={handleLogout}
                  danger
                >
                  Logout
                </DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
