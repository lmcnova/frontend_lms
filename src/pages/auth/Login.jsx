import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store';
import { loginSchema } from '../../utils/validators';
import { Button, Input } from '../../components/common';
import { BookOpen, Mail, Lock, Sparkles, GraduationCap, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email_id: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email: data.email_id });
      const result = await login(data);
      console.log('Login result:', result);

      if (result.success) {
        console.log('✅ Login successful!');
        console.log('User role:', result.role);
        console.log('User data:', result.user);

        toast.success(`Welcome back! Redirecting to ${result.role} dashboard...`);

        // Small delay to show the toast
        setTimeout(() => {
          // Redirect based on role
          const role = result.role;
          const dashboardPath =
            role === 'admin' ? '/admin/dashboard' :
            role === 'teacher' ? '/teacher/dashboard' :
            role === 'student' ? '/student/dashboard' : '/';

          console.log(`🔀 Redirecting to: ${dashboardPath}`);
          navigate(dashboardPath, { replace: true });
        }, 500);
      } else {
        console.error('❌ Login failed:', result.error);
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error(error?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 mb-6 shadow-2xl shadow-primary-500/50 animate-pulse">
              <BookOpen size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-800/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  {...register('email_id')}
                  error={errors.email_id?.message}
                  leftIcon={<Mail size={18} />}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  leftIcon={<Lock size={18} />}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Register Links */}
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to="/register/admin">
                  <Button variant="outline" fullWidth size="sm" className="hover:border-primary-500 hover:text-primary-600">
                    Register as Admin
                  </Button>
                </Link>
                <Link to="/register/student">
                  <Button variant="outline" fullWidth size="sm" className="hover:border-primary-500 hover:text-primary-600">
                    Register as Student
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              Demo Credentials:
            </p>
            <div className="text-xs text-blue-700 dark:text-blue-400 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[60px]">Admin:</span>
                <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">admin@example.com / admin123</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[60px]">Teacher:</span>
                <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">teacher@example.com / teacher123</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[60px]">Student:</span>
                <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">student@example.com / student123</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-lg text-white space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Learn at Your Own Pace
              </h1>
              <p className="text-xl text-primary-100">
                Access world-class courses, track your progress, and earn certificates that matter.
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Rich Content Library</h3>
                  <p className="text-primary-100">High-quality videos, interactive quizzes, and hands-on assignments</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Track Your Progress</h3>
                  <p className="text-primary-100">Detailed analytics and insights into your learning journey</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Earn Certificates</h3>
                  <p className="text-primary-100">Get recognized for your achievements with verified certificates</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <p className="text-4xl font-bold">1000+</p>
                <p className="text-primary-100 text-sm">Courses</p>
              </div>
              <div>
                <p className="text-4xl font-bold">50K+</p>
                <p className="text-primary-100 text-sm">Students</p>
              </div>
              <div>
                <p className="text-4xl font-bold">98%</p>
                <p className="text-primary-100 text-sm">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
