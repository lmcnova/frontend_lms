import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, Badge, LoadingSpinner, Avatar, FileUpload } from '../../components/common';
import { teacherAPI } from '../../api';
import { Search, Plus, Edit2, Trash2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await teacherAPI.getAll();
      setTeachers(response.data || []);
    } catch (error) {
      toast.error('Failed to load teachers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = () => {
    setEditingTeacher(null);
    setSkills([]);
    setAvatarFile(null);
    reset({
      name: '',
      email_id: '',
      bio: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setSkills(teacher.skills || []);
    setAvatarFile(teacher.avatar_url || null);
    reset({
      name: teacher.name,
      email_id: teacher.email_id,
      bio: teacher.bio || '',
      password: '', // Don't pre-fill password
    });
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await teacherAPI.delete(teacherId);
      toast.success('Teacher deleted successfully');
      loadTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
      console.error(error);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const onSubmit = async (data) => {
    try {
      console.log('=== FORM SUBMISSION START ===');
      console.log('Form data:', data);
      console.log('Skills:', skills);
      console.log('Avatar file:', avatarFile);

      // Clear previous errors
      clearErrors();

      // Validate required fields
      let hasError = false;

      if (!data.name || data.name.trim() === '') {
        setError('name', { type: 'manual', message: 'Name is required' });
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

      // Password validation - required for create, optional for edit
      if (!editingTeacher) {
        // Creating new teacher - password is required
        if (!data.password || data.password.trim() === '') {
          setError('password', { type: 'manual', message: 'Password is required for new teacher' });
          hasError = true;
        } else if (data.password.trim().length < 6) {
          setError('password', { type: 'manual', message: 'Password must be at least 6 characters' });
          hasError = true;
        }
      } else {
        // Editing existing teacher - password is optional, but if provided, must meet requirements
        if (data.password && data.password.trim() !== '' && data.password.trim().length < 6) {
          setError('password', { type: 'manual', message: 'Password must be at least 6 characters' });
          hasError = true;
        }
      }

      if (hasError) {
        toast.error('Please fix the validation errors');
        return;
      }

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Build teacher object
      const teacherData = {
        name: data.name.trim(),
        email_id: data.email_id.trim(),
        skills: skills || [],
        bio: data.bio?.trim() || undefined,
      };

      // Add password if provided (required for create, optional for update)
      if (data.password && data.password.trim() !== '') {
        teacherData.password = data.password.trim();
      }

      // Add teacher data as JSON string to form
      formData.append('teacher', JSON.stringify(teacherData));

      // Add avatar file if it exists and is a File object
      if (avatarFile && avatarFile instanceof File) {
        formData.append('avatar', avatarFile);
      }

      console.log('Final FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      if (editingTeacher) {
        console.log('Updating teacher:', editingTeacher.uuid_id);
        await teacherAPI.update(editingTeacher.uuid_id, formData);
        toast.success('Teacher updated successfully');
      } else {
        console.log('Creating new teacher...');
        await teacherAPI.create(formData);
        toast.success('Teacher created successfully');
      }

      setIsModalOpen(false);
      setAvatarFile(null);
      loadTeachers();
      console.log('=== FORM SUBMISSION SUCCESS ===');
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
          : error.response.data.detail)
        : (error.message || 'Operation failed');

      toast.error(errorMessage);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading teachers..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Teachers Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage instructors and their expertise
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateTeacher}>
            Add New Teacher
          </Button>
        </div>

        {/* Statistics Cards */}
        {teachers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {teachers.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Teachers</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {teachers.filter(t => t.skills && t.skills.length > 0).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Skills</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {teachers.filter(t => t.avatar_url).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Avatar</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Array.from(new Set(teachers.flatMap(t => t.skills || []))).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Skills</p>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <Input
            placeholder="Search teachers by name, email, or skills..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Teachers Grid */}
        <Card>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <UserCog className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? 'No teachers found' : 'No teachers yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first teacher'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateTeacher} leftIcon={<Plus size={18} />}>
                  Add Your First Teacher
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.uuid_id}
                  className="group relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar
                          src={teacher.avatar_url}
                          name={teacher.name}
                          size="lg"
                          className="ring-2 ring-white dark:ring-gray-900 shadow-md"
                        />
                        {teacher.skills && teacher.skills.length > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{teacher.skills.length}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                          {teacher.email_id}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {teacher.bio && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                          {teacher.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {teacher.skills && teacher.skills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-4 bg-primary-500 rounded-full" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Expertise
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.skills.slice(0, 4).map((skill, idx) => (
                            <Badge key={idx} variant="primary" size="sm" className="shadow-sm">
                              {skill}
                            </Badge>
                          ))}
                          {teacher.skills.length > 4 && (
                            <Badge variant="secondary" size="sm" className="shadow-sm">
                              +{teacher.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTeacher(teacher)}
                        leftIcon={<Edit2 size={16} />}
                        className="flex-1 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher.uuid_id)}
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
                <UserCog className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingTeacher ? 'Update teacher information' : 'Add a new instructor to the platform'}
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
                  Basic Information
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teacher Name"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="John Doe"
                />

                <Input
                  label="Email Address"
                  type="email"
                  {...register('email_id')}
                  error={errors.email_id?.message}
                  placeholder="teacher@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                  placeholder="Experienced educator with expertise in..."
                />
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Optional - Brief description about the teacher
                </p>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-secondary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Profile Picture
                </h4>
              </div>

              <FileUpload
                label="Avatar Image"
                type="image"
                accept="image/*"
                value={avatarFile}
                onChange={setAvatarFile}
                helperText="PNG, JPG up to 2MB - Optional profile picture"
              />
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-accent-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Expertise & Skills
                </h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Skills
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill (e.g., JavaScript, React, Python)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill(e);
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} size="sm" className="shrink-0">
                    Add
                  </Button>
                </div>
                {skills.length > 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="primary"
                          size="sm"
                          className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Click on a skill to remove it
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No skills added yet. Add skills to showcase expertise.
                    </p>
                  </div>
                )}
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
                helperText={editingTeacher ? 'Leave blank to keep current password' : 'Required for new teacher'}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[140px]">
                {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
