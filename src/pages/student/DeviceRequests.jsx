import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, Badge, LoadingSpinner } from '../../components/common';
import { deviceAPI } from '../../api';
import { Smartphone, AlertCircle, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRelativeTime } from '../../utils/formatters';

export default function StudentDeviceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await deviceAPI.getRequests();
      // Filter to show only current user's requests (backend should handle this)
      setRequests(response.data || []);
    } catch (error) {
      toast.error('Failed to load device requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    reset({
      reason: '',
      device_info: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      await deviceAPI.requestReset({
        reason: data.reason.trim(),
        device_info: data.device_info?.trim() || '',
      });

      toast.success('Device reset request submitted successfully');
      setIsModalOpen(false);
      loadRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit request';
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading requests..." />
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
              Device Requests
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your device reset requests
            </p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={handleCreateRequest}>
            New Request
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                About Device Reset Requests
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                If you need to access your account from a new device or have reached your device limit,
                submit a reset request. An administrator will review your request and approve or reject it.
                Once approved, your device limit will be reset and you can log in from new devices.
              </p>
            </div>
          </div>
        </Card>

        {/* Requests List */}
        <Card>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No device requests yet</p>
              <Button onClick={handleCreateRequest} leftIcon={<Plus size={18} />}>
                Submit Your First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Your Requests ({requests.length})
              </h2>

              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.uuid_id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(request.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Device Reset Request
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Submitted {formatRelativeTime(request.created_at)}
                            </p>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.reason}
                          </p>
                        </div>

                        {/* Device Info */}
                        {request.device_info && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Device Information:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.device_info}
                            </p>
                          </div>
                        )}

                        {/* Admin Response */}
                        {request.admin_note && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Admin Response:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.admin_note}
                            </p>
                          </div>
                        )}

                        {/* Processed Info */}
                        {request.processed_at && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Processed {formatRelativeTime(request.processed_at)}
                            {request.processed_by_name && ` by ${request.processed_by_name}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Create Request Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Smartphone className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Request Device Reset
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submit a request to reset your device limit
                </p>
              </div>
            </div>
          }
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Info Alert */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Important:</p>
                  <p>
                    Please provide a clear reason for your device reset request. Admins will review
                    your request and may contact you if more information is needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for Device Reset <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('reason', {
                  required: 'Reason is required',
                  validate: value => value.trim() !== '' || 'Reason cannot be empty',
                  minLength: { value: 10, message: 'Reason must be at least 10 characters' }
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="4"
                placeholder="e.g., I lost my phone and need to log in from a new device..."
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Device Info Field (Optional) */}
            <Input
              label="Device Information (Optional)"
              {...register('device_info')}
              placeholder="e.g., New iPhone 15, Windows PC, etc."
              helperText="Provide information about the new device you want to use"
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
