import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, Badge, LoadingSpinner, Avatar } from '../../components/common';
import { deviceAPI } from '../../api';
import { Smartphone, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

export default function AdminDeviceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

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
      // Sort by created_at desc (newest first)
      const sortedRequests = (response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRequests(sortedRequests);
    } catch (error) {
      toast.error('Failed to load device requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setActionType('approve');
    reset({ admin_note: '' });
    setIsResponseModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setActionType('reject');
    reset({ admin_note: '' });
    setIsResponseModalOpen(true);
  };

  const onSubmitResponse = async (data) => {
    try {
      if (actionType === 'approve') {
        await deviceAPI.approve(selectedRequest.uuid_id);
        toast.success('Request approved successfully');
      } else {
        await deviceAPI.reject(selectedRequest.uuid_id);
        toast.success('Request rejected');
      }

      setIsResponseModalOpen(false);
      setSelectedRequest(null);
      setActionType(null);
      loadRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to process request';
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
    const config = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
    };
    const { variant, label } = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch =
      request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Device Reset Requests
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and manage student device reset requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            <Input
              placeholder="Search by student name, email, or reason..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== 'all' && (
                      <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {stats[status]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Requests List */}
        <Card>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all'
                  ? 'No requests found matching your filters'
                  : 'No device requests yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Requests ({filteredRequests.length})
              </h2>

              <div className="space-y-3">
                {filteredRequests.map((request) => (
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
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={request.student_avatar}
                              name={request.student_name}
                              size="md"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {request.student_name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.student_email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {request.student_department && `${request.student_department} • `}
                                Submitted {formatRelativeTime(request.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Admin Response:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {request.admin_note}
                            </p>
                          </div>
                        )}

                        {/* Processed Info */}
                        {request.processed_at && (
                          <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                            Processed on {formatDate(request.processed_at, 'MMM dd, yyyy HH:mm')}
                            {request.processed_by_name && ` by ${request.processed_by_name}`}
                          </div>
                        )}

                        {/* Actions */}
                        {request.status === 'pending' && (
                          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                            <Button
                              variant="success"
                              size="sm"
                              leftIcon={<CheckCircle2 size={16} />}
                              onClick={() => handleApprove(request)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<XCircle size={16} />}
                              onClick={() => handleReject(request)}
                            >
                              Reject
                            </Button>
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

        {/* Response Modal */}
        <Modal
          isOpen={isResponseModalOpen}
          onClose={() => setIsResponseModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                actionType === 'approve'
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {actionType === 'approve' ? (
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                ) : (
                  <XCircle className="text-red-600 dark:text-red-400" size={20} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Device Reset Request
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedRequest?.student_name}
                </p>
              </div>
            </div>
          }
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmitResponse)} className="space-y-6">
            {/* Confirmation Message */}
            <div className={`p-4 rounded-lg border ${
              actionType === 'approve'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                actionType === 'approve'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {actionType === 'approve' ? (
                  <>
                    You are about to <strong>approve</strong> this device reset request.
                    The student's device limit will be reset, allowing them to log in from new devices.
                  </>
                ) : (
                  <>
                    You are about to <strong>reject</strong> this device reset request.
                    The student will need to submit a new request if they still need device access.
                  </>
                )}
              </p>
            </div>

            {/* Admin Note (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Note to Student (Optional)
              </label>
              <textarea
                {...register('admin_note')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="3"
                placeholder={
                  actionType === 'approve'
                    ? 'Add any instructions or notes for the student...'
                    : 'Provide a reason for rejection...'
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsResponseModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={actionType === 'approve' ? 'success' : 'danger'}
                className="min-w-[120px]"
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
