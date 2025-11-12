import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, LoadingSpinner } from '../../components/common';
import { departmentAPI } from '../../api';
import { useAuthStore } from '../../store';
import { departmentSchema } from '../../utils/validators';
import { Search, Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
  const { user } = useAuthStore();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    reset({
      name: '',
      code: '',
      description: '',
      admin_uuid_id: user?.uuid_id || '',
    });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    reset({
      name: department.name,
      code: department.code,
      description: department.description || '',
      admin_uuid_id: department.admin_uuid_id,
    });
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      await departmentAPI.delete(departmentId);
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingDepartment) {
        await departmentAPI.update(editingDepartment.uuid_id, data);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.create(data);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error(error);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading departments..." />
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
              Departments Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage departments in your organization
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateDepartment}>
            Add Department
          </Button>
        </div>

        {/* Search */}
        <Card>
          <Input
            placeholder="Search departments by name, code, or description..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Departments Grid */}
        <Card>
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No departments found' : 'No departments yet'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={handleCreateDepartment} leftIcon={<Plus size={18} />}>
                  Create Your First Department
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.uuid_id}
                  className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {dept.name}
                      </h3>
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {dept.code}
                      </p>
                    </div>
                  </div>

                  {dept.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {dept.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDepartment(dept)}
                      leftIcon={<Edit2 size={16} />}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDepartment(dept.uuid_id)}
                      leftIcon={<Trash2 size={16} />}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
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
          title={editingDepartment ? 'Edit Department' : 'Add New Department'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Department Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Computer Science"
            />

            <Input
              label="Department Code"
              {...register('code')}
              error={errors.code?.message}
              placeholder="CS"
              helperText="Short code for the department (e.g., CS, EE, ME)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input-base w-full"
                placeholder="Optional description about the department..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <Input
              label="Admin UUID"
              {...register('admin_uuid_id')}
              error={errors.admin_uuid_id?.message}
              placeholder="Admin UUID"
              helperText="UUID of the admin this department belongs to"
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDepartment ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
