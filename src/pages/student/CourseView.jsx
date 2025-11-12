import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge, LoadingSpinner, Avatar } from '../../components/common';
import { courseAPI, topicAPI, videoAPI, teacherAPI, progressAPI } from '../../api';
import { BookOpen, Play, CheckCircle2, Clock, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDuration } from '../../utils/formatters';

export default function StudentCourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState({});
  const [instructor, setInstructor] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [completedVideos, setCompletedVideos] = useState(new Set());

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      // Load course details
      const courseRes = await courseAPI.getById(courseId);
      const courseData = courseRes.data;
      setCourse(courseData);

      // Load instructor
      if (courseData.instructor_uuid) {
        try {
          const instructorRes = await teacherAPI.getById(courseData.instructor_uuid);
          setInstructor(instructorRes.data);
        } catch (error) {
          console.error('Failed to load instructor:', error);
        }
      }

      // Load topics
      const topicsRes = await topicAPI.getByCourse(courseId);
      const topicsData = (topicsRes.data || []).sort((a, b) => a.order_index - b.order_index);
      setTopics(topicsData);

      // Load videos for each topic
      const videosMap = {};
      for (const topic of topicsData) {
        try {
          const videosRes = await videoAPI.getByTopic(topic.uuid_id);
          videosMap[topic.uuid_id] = (videosRes.data || []).sort((a, b) => a.order_index - b.order_index);
        } catch (error) {
          console.error(`Failed to load videos for topic ${topic.uuid_id}:`, error);
          videosMap[topic.uuid_id] = [];
        }
      }
      setVideos(videosMap);

      // Load progress
      try {
        const progressRes = await progressAPI.getMy();
        const courseProgress = (progressRes.data || []).find(p => p.course_uuid === courseId);
        setProgress(courseProgress);

        // Mark completed videos
        if (courseProgress?.completed_videos) {
          setCompletedVideos(new Set(courseProgress.completed_videos));
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }

      // Auto-expand first topic
      if (topicsData.length > 0) {
        setExpandedTopics(new Set([topicsData[0].uuid_id]));
      }
    } catch (error) {
      toast.error('Failed to load course');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const handlePlayVideo = (videoId) => {
    navigate(`/student/courses/${courseId}/video/${videoId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading course..." />
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Course not found</p>
            <Button className="mt-4" onClick={() => navigate('/student/courses')}>
              Back to My Courses
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const progressPercent = progress?.progress_percent || 0;
  const totalVideos = Object.values(videos).reduce((sum, vids) => sum + vids.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <Card>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="md:w-1/3">
              <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-white" />
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="md:w-2/3 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {course.description || 'No description available'}
                </p>
              </div>

              {/* Instructor */}
              {instructor && (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={instructor.avatar_url}
                    name={instructor.name}
                    size="md"
                  />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{instructor.name}</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Play size={18} />
                  <span>{totalVideos} videos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock size={18} />
                  <span>{progress?.learning_hours?.toFixed(1) || 0}h watched</span>
                </div>
                <Badge variant="primary">{course.level}</Badge>
                <Badge variant="secondary">{course.category}</Badge>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Course Progress</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {progressPercent}% Complete
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Course Content */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Course Content
          </h2>

          {topics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No content available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, topicIndex) => {
                const topicVideos = videos[topic.uuid_id] || [];
                const isExpanded = expandedTopics.has(topic.uuid_id);
                const completedCount = topicVideos.filter(v => completedVideos.has(v.uuid_id)).length;
                const totalCount = topicVideos.length;

                return (
                  <div
                    key={topic.uuid_id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                  >
                    {/* Topic Header */}
                    <button
                      onClick={() => toggleTopic(topic.uuid_id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center font-semibold text-sm">
                          {topicIndex + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {completedCount} / {totalCount} videos completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {completedCount === totalCount && totalCount > 0 && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Videos List */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-800">
                        {topicVideos.length === 0 ? (
                          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                            No videos in this topic yet
                          </div>
                        ) : (
                          topicVideos.map((video, videoIndex) => {
                            const isCompleted = completedVideos.has(video.uuid_id);
                            const isPreview = video.is_preview;

                            return (
                              <button
                                key={video.uuid_id}
                                onClick={() => handlePlayVideo(video.uuid_id)}
                                className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : isPreview ? (
                                    <Play className="w-5 h-5 text-primary-600" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {videoIndex + 1}. {video.title}
                                  </p>
                                  {video.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                      {video.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex-shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                  {formatDuration(video.duration)}
                                </div>
                                {isPreview && (
                                  <Badge variant="secondary" size="sm">
                                    Preview
                                  </Badge>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
