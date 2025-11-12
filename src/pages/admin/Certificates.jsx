import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, Badge, LoadingSpinner, Select, FileUpload } from '../../components/common';
import { certificateAPI, studentAPI, courseAPI } from '../../api';
import { Award, Plus, Edit2, Trash2, Upload, RotateCcw, Ban, CheckCircle, Search, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certsRes, studentsRes, coursesRes] = await Promise.all([
        certificateAPI.getAll(),
        studentAPI.getAll(),
        courseAPI.getAll(),
      ]);
      setCertificates(certsRes.data || []);
      setStudents(studentsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertificate = () => {
    setEditingCertificate(null);
    setCertificateFile(null);
    reset({
      course_uuid: '',
      student_uuid: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificate(certificate);
    reset({
      notes: certificate.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to permanently delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      await certificateAPI.delete(certificateId);
      toast.success('Certificate deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete certificate');
      console.error(error);
    }
  };

  const handleRevoke = async (certificateId) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) {
      return;
    }

    try {
      await certificateAPI.revoke(certificateId);
      toast.success('Certificate revoked successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to revoke certificate');
      console.error(error);
    }
  };

  const handleRestore = async (certificateId) => {
    try {
      await certificateAPI.restore(certificateId);
      toast.success('Certificate restored successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to restore certificate');
      console.error(error);
    }
  };

  const handleUploadClick = (certificate) => {
    setUploadingCertificate(certificate);
    setCertificateFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadCertificate = async () => {
    if (!certificateFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await certificateAPI.upload(uploadingCertificate.certificate_id, certificateFile);
      toast.success('Certificate file uploaded successfully');
      setIsUploadModalOpen(false);
      setCertificateFile(null);
      loadData();
    } catch (error) {
      toast.error('Failed to upload certificate file');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      clearErrors();

      if (editingCertificate) {
        // Update existing certificate
        const updateData = {
          notes: data.notes?.trim() || undefined,
        };
        await certificateAPI.update(editingCertificate.certificate_id, updateData);
        toast.success('Certificate updated successfully');
      } else {
        // Create new certificate
        if (!data.course_uuid) {
          setError('course_uuid', { type: 'manual', message: 'Course is required' });
          return;
        }
        if (!data.student_uuid) {
          setError('student_uuid', { type: 'manual', message: 'Student is required' });
          return;
        }

        const createData = {
          course_uuid: data.course_uuid,
          student_uuid: data.student_uuid,
          notes: data.notes?.trim() || undefined,
        };

        await certificateAPI.issue(createData);
        toast.success('Certificate issued successfully');
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Operation failed';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !cert.revoked) ||
      (filterStatus === 'revoked' && cert.revoked);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading certificates..." />
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
              Certificate Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Issue, manage, and revoke certificates
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateCertificate}>
            Issue Certificate
          </Button>
        </div>

        {/* Statistics */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {certificates.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Certificates</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {certificates.filter(c => !c.revoked).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {certificates.filter(c => c.revoked).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revoked</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {certificates.filter(c => c.url).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Files</p>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, course, or code..."
                leftIcon={<Search size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Certificates' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'revoked', label: 'Revoked Only' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Certificates Grid */}
        <Card>
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? 'No certificates found' : 'No certificates yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Issue certificates to students who complete courses'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateCertificate} leftIcon={<Plus size={18} />}>
                  Issue First Certificate
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((certificate) => (
                <div
                  key={certificate.certificate_id}
                  className="group relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      {certificate.revoked ? (
                        <Badge variant="danger" size="sm">
                          <Ban size={14} className="mr-1" />
                          Revoked
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          <CheckCircle size={14} className="mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                        {certificate.course_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Student: <span className="font-medium">{certificate.student_name}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Issued: {new Date(certificate.issued_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Code */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Verification Code
                      </div>
                      <div className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">
                        {certificate.code}
                      </div>
                    </div>

                    {/* Completion */}
                    {certificate.completion_percentage && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Completion: <span className="font-semibold text-green-600">
                          {certificate.completion_percentage}%
                        </span>
                      </div>
                    )}

                    {/* File Status */}
                    {certificate.url ? (
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle size={12} />
                        <span>File uploaded</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Upload size={12} />
                        <span>No file</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUploadClick(certificate)}
                        leftIcon={<Upload size={16} />}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Upload
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCertificate(certificate)}
                        leftIcon={<Edit2 size={16} />}
                        className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        Edit
                      </Button>
                      {certificate.revoked ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(certificate.certificate_id)}
                          leftIcon={<RotateCcw size={16} />}
                          className="hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(certificate.certificate_id)}
                          leftIcon={<Ban size={16} />}
                          className="hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600"
                        >
                          Revoke
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCertificate(certificate.certificate_id)}
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
                <Award className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingCertificate ? 'Edit Certificate' : 'Issue New Certificate'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingCertificate ? 'Update certificate details' : 'Issue a certificate to a student'}
                </p>
              </div>
            </div>
          }
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!editingCertificate && (
              <>
                {/* Student Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                      Student & Course
                    </h4>
                  </div>

                  <Select
                    label="Student"
                    {...register('student_uuid')}
                    error={errors.student_uuid?.message}
                    placeholder="Select a student"
                    options={students.map((student) => ({
                      value: student.uuid_id,
                      label: `${student.student_name} (${student.email_id})`,
                    }))}
                  />

                  <Select
                    label="Course"
                    {...register('course_uuid')}
                    error={errors.course_uuid?.message}
                    placeholder="Select a course"
                    options={courses.map((course) => ({
                      value: course.uuid_id,
                      label: course.title,
                    }))}
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-secondary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Additional Information
                </h4>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                  placeholder="Any additional notes about this certificate..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[140px]">
                {editingCertificate ? 'Update Certificate' : 'Issue Certificate'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Upload className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Upload Certificate File
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload PDF or image file for the certificate
                </p>
              </div>
            </div>
          }
          size="md"
        >
          <div className="space-y-6">
            <FileUpload
              label="Certificate File"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              value={certificateFile}
              onChange={setCertificateFile}
              helperText="PDF, JPG, or PNG up to 10MB"
            />

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadCertificate}
                leftIcon={<Upload size={16} />}
                disabled={!certificateFile}
              >
                Upload File
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
