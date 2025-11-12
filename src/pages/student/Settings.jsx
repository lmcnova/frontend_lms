import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Avatar, LoadingSpinner, FileUpload } from '../../components/common';
import { studentAPI, authAPI } from '../../api';
import { useAuthStore, useThemeStore } from '../../store';
import {
  User,
  Mail,
  Lock,
  Bell,
  Moon,
  Sun,
  Globe,
  Save,
  Smartphone,
  LogOut,
  Shield,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentSettings() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user, resetProfile]);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    try {
      const response = await authAPI.getSessions();
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const onSubmitProfile = async (data) => {
    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('email', data.email.trim());
      if (data.phone?.trim()) {
        formData.append('phone', data.phone.trim());
      }

      // Add avatar if it's a new file
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await studentAPI.update(user.uuid_id, formData);

      updateUser(response.data);
      setAvatarFile(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setLoading(true);
      await studentAPI.update(user.uuid_id, {
        password: data.new_password,
      });

      resetPassword();
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to log out from all devices? You will need to log in again on this device.')) {
      return;
    }

    try {
      await authAPI.logoutAll();
      toast.success('Logged out from all devices');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout from all devices');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64">
            <Card className="p-2">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Profile Information
                </h2>

                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar
                      src={user?.avatar_url}
                      name={user?.name}
                      size="xl"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        PNG, JPG up to 2MB
                      </p>
                      <Button size="sm" variant="outline">
                        Upload Photo
                      </Button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <Input
                    label="Full Name"
                    leftIcon={<User size={18} />}
                    {...registerProfile('name', {
                      required: 'Name is required',
                      validate: value => value.trim() !== '' || 'Name cannot be empty'
                    })}
                    error={profileErrors.name?.message}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    leftIcon={<Mail size={18} />}
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={profileErrors.email?.message}
                  />

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    leftIcon={<Smartphone size={18} />}
                    {...registerProfile('phone')}
                    placeholder="+1 (555) 000-0000"
                  />

                  {/* Department & Role (Read-only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Department"
                      value={user?.department || 'Not assigned'}
                      disabled
                    />
                    <Input
                      label="Role"
                      value="Student"
                      disabled
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      type="submit"
                      leftIcon={<Save size={18} />}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Change Password
                </h2>

                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    leftIcon={<Lock size={18} />}
                    {...registerPassword('current_password', {
                      required: 'Current password is required'
                    })}
                    error={passwordErrors.current_password?.message}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    leftIcon={<Lock size={18} />}
                    {...registerPassword('new_password', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    error={passwordErrors.new_password?.message}
                    helperText="Must be at least 8 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    leftIcon={<Lock size={18} />}
                    {...registerPassword('confirm_password', {
                      required: 'Please confirm your password',
                      validate: value => value === watch('new_password') || 'Passwords do not match'
                    })}
                    error={passwordErrors.confirm_password?.message}
                  />

                  {/* Actions */}
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      type="submit"
                      leftIcon={<Save size={18} />}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Preferences
                </h2>

                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                      Appearance
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          theme === 'light'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Sun size={24} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">Light</p>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          theme === 'dark'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Moon size={24} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">Dark</p>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          theme === 'system'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Globe size={24} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">System</p>
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Bell size={18} />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Course Updates', description: 'New videos and course content' },
                        { label: 'Assignment Reminders', description: 'Upcoming deadlines and tasks' },
                        { label: 'Achievement Notifications', description: 'Certificates and milestones' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Security
                </h2>

                <div className="space-y-6">
                  {/* Active Sessions */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      {sessions.map((session, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {session.device_name || 'Unknown Device'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Last active: {new Date(session.last_activity).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {session.is_current && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logout All */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      variant="danger"
                      leftIcon={<LogOut size={18} />}
                      onClick={handleLogoutAll}
                    >
                      Logout from All Devices
                    </Button>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      This will log you out from all devices. You'll need to log in again.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
