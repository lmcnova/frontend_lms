import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminRegisterSchema } from '../../utils/validators';
import { adminAPI } from '../../api';
import { Button, Input } from '../../components/common';
import { BookOpen, Building2, Mail, Lock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterAdmin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminRegisterSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.create(data);
      toast.success('Admin registered successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 mb-4">
              <BookOpen size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Admin Registration
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create an admin account for your institution
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="College/Institution Name"
              {...register('college_name')}
              error={errors.college_name?.message}
              leftIcon={<Building2 size={18} />}
              placeholder="XYZ University"
            />

            <Input
              label="Email Address"
              type="email"
              {...register('email_id')}
              error={errors.email_id?.message}
              leftIcon={<Mail size={18} />}
              placeholder="admin@university.edu"
            />

            <Input
              label="Student Limit"
              type="number"
              {...register('total_student_allow_count', { valueAsNumber: true })}
              error={errors.total_student_allow_count?.message}
              leftIcon={<Users size={18} />}
              placeholder="500"
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              leftIcon={<Lock size={18} />}
              placeholder="Min 6 characters"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-6"
            >
              Register
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
