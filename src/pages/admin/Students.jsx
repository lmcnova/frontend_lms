import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Select, Modal, Badge, LoadingSpinner, Avatar } from '../../components/common';
import { studentAPI, departmentAPI } from '../../api';
import { Search, Plus, Edit2, Trash2, UserPlus, Mail, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function AdminStudents() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    loadStudents();
    loadDepartments();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data || []);
    } catch (error) {
      toast.error('Failed to load students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
      console.error(error);
    }
  };

  const handleCreateStudent = () => {
    setEditingStudent(null);
    reset({
      student_name: '',
      department: '',
      email_id: '',
      sub_department: '',
      admin_uuid_id: user?.uuid_id || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    reset({
      student_name: student.student_name,
      department: student.department,
      email_id: student.email_id,
      sub_department: student.sub_department || '',
      admin_uuid_id: student.admin_uuid_id,
      password: '', // Don't pre-fill password
    });
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentAPI.delete(studentId);
      toast.success('Student deleted successfully');
      loadStudents();
    } catch (error) {
      toast.error('Failed to delete student');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Clear previous errors
      clearErrors();

      // Validate required fields
      let hasError = false;

      if (!data.student_name || data.student_name.trim() === '') {
        setError('student_name', { type: 'manual', message: 'Student name is required' });
        hasError = true;
      }

      if (!data.email_id || data.email_id.trim() === '') {
        setError('email_id', { type: 'manual', message: 'Email is required' });
        hasError = true;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data.email_id && !emailRegex.test(data.email_id.trim())) {
        setError('email_id', { type: 'manual', message: 'Invalid email address' });
        hasError = true;
      }

      if (!data.department || data.department.trim() === '') {
        setError('department', { type: 'manual', message: 'Department is required' });
        hasError = true;
      }

      // Password validation - required for create, optional for edit
      if (!editingStudent) {
        // Creating new student - password is required
        if (!data.password || data.password.trim() === '') {
          setError('password', { type: 'manual', message: 'Password is required for new student' });
          hasError = true;
        } else if (data.password.trim().length < 6) {
          setError('password', { type: 'manual', message: 'Password must be at least 6 characters' });
          hasError = true;
        }
      } else {
        // Editing existing student - password is optional, but if provided, must meet requirements
        if (data.password && data.password.trim() !== '' && data.password.trim().length < 6) {
          setError('password', { type: 'manual', message: 'Password must be at least 6 characters' });
          hasError = true;
        }
      }

      if (hasError) {
        toast.error('Please fix the validation errors');
        return;
      }

      // Automatically set admin_uuid_id from logged-in user
      const studentData = {
        student_name: data.student_name.trim(),
        email_id: data.email_id.trim(),
        department: data.department.trim(),
        sub_department: data.sub_department?.trim() || undefined,
        admin_uuid_id: user?.uuid_id,
      };

      // Add password if provided (required for create, optional for update)
      if (data.password && data.password.trim() !== '') {
        studentData.password = data.password.trim();
      }

      if (editingStudent) {
        await studentAPI.update(editingStudent.uuid_id, studentData);
        toast.success('Student updated successfully');
      } else {
        await studentAPI.create(studentData);
        toast.success('Student created successfully');
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error(error);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading students..." />
      </DashboardLayout>
    );
  }

  // Get department counts
  const departmentCounts = students.reduce((acc, student) => {
    const dept = student.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const uniqueDepartments = Object.keys(departmentCounts).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Students Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage student accounts and enrollments
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateStudent}>
            Add New Student
          </Button>
        </div>

        {/* Statistics Cards */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {students.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {uniqueDepartments}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {students.filter(s => s.sub_department).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Sub-Dept</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.keys(departmentCounts).length > 0
                    ? Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])[0][0]
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top Department</p>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <Input
            placeholder="Search students by name, email, or department..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Students Grid */}
        <Card>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? 'No students found' : 'No students yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first student'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateStudent} leftIcon={<Plus size={18} />}>
                  Add Your First Student
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.uuid_id}
                  className="group relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar
                          name={student.student_name}
                          size="lg"
                          className="ring-2 ring-white dark:ring-gray-900 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <GraduationCap size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                          {student.student_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                          <Mail size={14} />
                          {student.email_id}
                        </p>
                      </div>
                    </div>

                    {/* Department Info */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Department
                        </span>
                        <Badge variant="primary" size="sm">
                          {student.department}
                        </Badge>
                      </div>
                      {student.sub_department && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Sub Department
                          </span>
                          <Badge variant="secondary" size="sm">
                            {student.sub_department}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                        leftIcon={<Edit2 size={16} />}
                        className="flex-1 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.uuid_id)}
                        leftIcon={<Trash2 size={16} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <GraduationCap className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingStudent ? 'Update student information' : 'Add a new student to the platform'}
                </p>
              </div>
            </div>
          }
          size="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Personal Information
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Student Name"
                  {...register('student_name')}
                  error={errors.student_name?.message}
                  placeholder="John Doe"
                />

                <Input
                  label="Email Address"
                  type="email"
                  {...register('email_id')}
                  error={errors.email_id?.message}
                  placeholder="student@example.com"
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-secondary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Academic Details
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Department"
                  {...register('department')}
                  error={errors.department?.message}
                  placeholder="Select Department"
                  options={departments.map((dept) => ({
                    value: dept.name,
                    label: dept.name,
                  }))}
                />

                <Input
                  label="Sub Department"
                  {...register('sub_department')}
                  error={errors.sub_department?.message}
                  placeholder="e.g., AI & ML, Robotics"
                  helperText="Optional specialization"
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Security
                </h4>
              </div>

              <Input
                label="Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="Min 6 characters"
                helperText={editingStudent ? 'Leave blank to keep current password' : 'Required for new student'}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[140px]">
                {editingStudent ? 'Update Student' : 'Create Student'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
