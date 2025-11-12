import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, LoadingSpinner } from '../../components/common';
import { courseAPI, topicAPI } from '../../api';
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, GripVertical, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseTopics() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load course details
      const courseRes = await courseAPI.getById(courseId);
      setCourse(courseRes.data);

      // Load topics for this course
      const topicsRes = await topicAPI.getByCourse(courseId);
      setTopics(topicsRes.data || []);
    } catch (error) {
      toast.error('Failed to load course data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = () => {
    setEditingTopic(null);
    reset({
      title: '',
      description: '',
      order_index: topics.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    reset({
      title: topic.title,
      description: topic.description || '',
      order_index: topic.order_index,
    });
    setIsModalOpen(true);
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic? All videos under this topic will also be deleted. This action cannot be undone.')) {
      return;
    }

    try {
      await topicAPI.delete(topicId);
      toast.success('Topic deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete topic');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const topicData = {
        title: data.title.trim(),
        description: data.description.trim(),
        order_index: parseInt(data.order_index) || topics.length + 1,
      };

      if (editingTopic) {
        await topicAPI.update(editingTopic.uuid_id, topicData);
        toast.success('Topic updated successfully');
      } else {
        await topicAPI.create(courseId, topicData);
        toast.success('Topic created successfully');
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving topic:', error);
      const errorMessage = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
          : error.response.data.detail)
        : (error.message || 'Operation failed');
      toast.error(errorMessage);
    }
  };

  const handleManageVideos = (topicId) => {
    navigate(`/admin/courses/${courseId}/topics/${topicId}/videos`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading topics..." />
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Course not found</p>
          <Button className="mt-4" onClick={() => navigate('/admin/courses')}>
            Back to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/admin/courses')}
            className="mb-4"
          >
            Back to Courses
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {course.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage topics and organize course content
              </p>
            </div>
            <Button leftIcon={<Plus size={20} />} onClick={handleCreateTopic}>
              Add Topic
            </Button>
          </div>
        </div>

        {/* Course Info Card */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <BookOpen className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Course Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {course.description}
              </p>
              <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <span>Level: <span className="font-medium">{course.level}</span></span>
                <span>Category: <span className="font-medium">{course.category}</span></span>
                <span>Topics: <span className="font-medium">{topics.length}</span></span>
              </div>
            </div>
          </div>
        </Card>

        {/* Topics List */}
        <Card>
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No topics yet</p>
              <Button className="mt-4" onClick={handleCreateTopic} leftIcon={<Plus size={18} />}>
                Create Your First Topic
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Course Topics ({topics.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map((topic, index) => (
                    <div
                      key={topic.uuid_id}
                      className="group relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative p-6 space-y-4">
                        {/* Header with Order Number */}
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold shadow-md">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                              {topic.title}
                            </h4>
                          </div>
                        </div>

                        {/* Description */}
                        {topic.description && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                              {topic.description}
                            </p>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Video size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">{topic.total_videos || 0} videos</span>
                          </div>
                          {topic.total_duration && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              <span>{Math.round(topic.total_duration / 60)} min</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleManageVideos(topic.uuid_id)}
                            leftIcon={<Video size={16} />}
                            className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Videos
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTopic(topic)}
                            className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTopic(topic.uuid_id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
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
                <BookOpen className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingTopic ? 'Edit Topic' : 'Create New Topic'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingTopic ? 'Update topic information' : 'Add a new topic to the course'}
                </p>
              </div>
            </div>
          }
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Topic Title"
              {...register('title', {
                required: 'Title is required',
                validate: value => value.trim() !== '' || 'Title cannot be empty'
              })}
              error={errors.title?.message}
              placeholder="e.g., Introduction to the Course"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="3"
                placeholder="Brief description of what this topic covers..."
              />
            </div>

            <Input
              label="Order Index"
              type="number"
              {...register('order_index')}
              defaultValue={topics.length + 1}
              helperText="The position of this topic in the course outline"
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                {editingTopic ? 'Update Topic' : 'Create Topic'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
