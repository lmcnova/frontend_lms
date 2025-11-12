import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Modal, LoadingSpinner, FileUpload } from '../../components/common';
import { courseAPI, topicAPI, videoAPI } from '../../api';
import { ArrowLeft, Plus, Edit2, Trash2, Video, Play, Clock, FileVideo, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TopicVideos() {
  const navigate = useNavigate();
  const { courseId, topicId } = useParams();
  const [course, setCourse] = useState(null);
  const [topic, setTopic] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const uploadMethod = watch('upload_method', 'file');

  useEffect(() => {
    if (courseId && topicId) {
      loadData();
    }
  }, [courseId, topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load course details
      const courseRes = await courseAPI.getById(courseId);
      setCourse(courseRes.data);

      // Load topic details
      const topicsRes = await topicAPI.getByCourse(courseId);
      const topicData = topicsRes.data?.find(t => t.uuid_id === topicId);
      setTopic(topicData);

      // Load videos for this topic
      const videosRes = await videoAPI.getByTopic(topicId);
      setVideos(videosRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = () => {
    setEditingVideo(null);
    setVideoFile(null);
    setThumbnailFile(null);
    reset({
      title: '',
      description: '',
      duration: '',
      order_index: videos.length + 1,
      upload_method: 'file',
      video_url: '',
    });
    setIsModalOpen(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setVideoFile(null);
    setThumbnailFile(video.thumbnail_url || null);
    reset({
      title: video.title,
      description: video.description || '',
      duration: video.duration || '',
      order_index: video.order_index,
      upload_method: video.video_url ? 'url' : 'file',
      video_url: video.video_url || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await videoAPI.delete(videoId);
      toast.success('Video deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete video');
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log('=== VIDEO FORM SUBMISSION START ===');
      console.log('Form data:', data);
      console.log('Upload method:', data.upload_method);
      console.log('Video file:', videoFile);

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Build video object
      const videoData = {
        title: data.title.trim(),
        description: data.description?.trim() || '',
        duration: data.duration ? parseInt(data.duration) : null,
        order_index: parseInt(data.order_index) || videos.length + 1,
      };

      // Add video_url if using URL method
      if (data.upload_method === 'url' && data.video_url?.trim()) {
        videoData.video_url = data.video_url.trim();
      }

      // Add video data as JSON string to form (required field named 'video')
      formData.append('video', JSON.stringify(videoData));

      // Add video file if using file upload method (field named 'video_file')
      if (data.upload_method === 'file' && videoFile && videoFile instanceof File) {
        formData.append('video_file', videoFile);
      }

      // Add thumbnail file if provided (field named 'thumbnail')
      if (thumbnailFile && thumbnailFile instanceof File) {
        formData.append('thumbnail', thumbnailFile);
      }

      console.log('Final FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      if (editingVideo) {
        await videoAPI.update(editingVideo.uuid_id, formData);
        toast.success('Video updated successfully');
      } else {
        await videoAPI.create(topicId, formData);
        toast.success('Video created successfully');
      }

      setIsModalOpen(false);
      setVideoFile(null);
      setThumbnailFile(null);
      loadData();
      console.log('=== VIDEO FORM SUBMISSION SUCCESS ===');
    } catch (error) {
      console.error('=== VIDEO FORM SUBMISSION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);

      const errorMessage = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
          : error.response.data.detail)
        : (error.message || 'Operation failed');

      toast.error(errorMessage);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading videos..." />
      </DashboardLayout>
    );
  }

  if (!course || !topic) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Course or topic not found</p>
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
            onClick={() => navigate(`/admin/courses/${courseId}/topics`)}
            className="mb-4"
          >
            Back to Topics
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {topic.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage videos for this topic
              </p>
            </div>
            <Button leftIcon={<Plus size={20} />} onClick={handleCreateVideo}>
              Add Video
            </Button>
          </div>
        </div>

        {/* Breadcrumb Info Card */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Video className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Topic: {topic.title}
              </p>
              {topic.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {topic.description}
                </p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <span>Videos: <span className="font-medium">{videos.length}</span></span>
                {topic.total_duration && (
                  <span>Total Duration: <span className="font-medium">{formatDuration(topic.total_duration)}</span></span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Videos List */}
        <Card>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No videos yet</p>
              <Button className="mt-4" onClick={handleCreateVideo} leftIcon={<Plus size={18} />}>
                Add Your First Video
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Videos ({videos.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map((video, index) => (
                    <div
                      key={video.uuid_id}
                      className="group relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative">
                        {/* Video Thumbnail */}
                        <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center relative overflow-hidden">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Play className="text-white" size={48} />
                          )}
                          {/* Duration Badge */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-medium px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                          {/* Order Badge */}
                          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-4 space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                            {video.title}
                          </h4>

                          {video.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {video.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{formatDuration(video.duration)}</span>
                            </div>
                            {video.video_url && (
                              <div className="flex items-center gap-1">
                                <LinkIcon size={14} />
                                <span>URL</span>
                              </div>
                            )}
                            {video.view_count !== undefined && (
                              <div className="flex items-center gap-1">
                                <Play size={14} />
                                <span>{video.view_count} views</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVideo(video)}
                              leftIcon={<Edit2 size={16} />}
                              className="flex-1 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVideo(video.uuid_id)}
                              leftIcon={<Trash2 size={16} />}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Delete
                            </Button>
                          </div>
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
                <Video className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingVideo ? 'Edit Video' : 'Add New Video'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingVideo ? 'Update video information' : 'Add a new video to this topic'}
                </p>
              </div>
            </div>
          }
          size="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Basic Information
                </h4>
              </div>

              <Input
                label="Video Title"
                {...register('title', {
                  required: 'Title is required',
                  validate: value => value.trim() !== '' || 'Title cannot be empty'
                })}
                error={errors.title?.message}
                placeholder="e.g., Introduction to Variables"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                  placeholder="Brief description of what this video covers..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Duration (seconds)"
                  type="number"
                  {...register('duration')}
                  placeholder="e.g., 300"
                  helperText="Video duration in seconds"
                />

                <Input
                  label="Order Index"
                  type="number"
                  {...register('order_index')}
                  defaultValue={videos.length + 1}
                  helperText="Position in the video list"
                />
              </div>
            </div>

            {/* Upload Method */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-secondary-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Video Source
                </h4>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="file"
                      {...register('upload_method')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Upload File</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="url"
                      {...register('upload_method')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Video URL</span>
                  </label>
                </div>
              </div>

              {uploadMethod === 'file' ? (
                <FileUpload
                  label="Video File"
                  type="video"
                  accept="video/*"
                  value={videoFile}
                  onChange={setVideoFile}
                  helperText="MP4, WebM, or other video formats (max 500MB)"
                />
              ) : (
                <Input
                  label="Video URL"
                  {...register('video_url', {
                    validate: value => {
                      if (uploadMethod === 'url' && !value?.trim()) {
                        return 'Video URL is required when using URL method';
                      }
                      return true;
                    }
                  })}
                  error={errors.video_url?.message}
                  placeholder="https://example.com/video.mp4"
                  helperText="Direct link to video file or streaming URL"
                />
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-4 bg-accent-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Thumbnail (Optional)
                </h4>
              </div>

              <FileUpload
                label="Video Thumbnail"
                type="image"
                accept="image/*"
                value={thumbnailFile}
                onChange={setThumbnailFile}
                helperText="PNG, JPG up to 2MB - Preview image for the video"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                {editingVideo ? 'Update Video' : 'Add Video'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
