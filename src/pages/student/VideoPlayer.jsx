import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { courseAPI, topicAPI, videoAPI, progressAPI } from '../../api';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  CheckCircle2,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDuration } from '../../utils/formatters';

export default function VideoPlayer() {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState({});
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [courseId, videoId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load course
      const courseRes = await courseAPI.getById(courseId);
      setCourse(courseRes.data);

      // Load topics
      const topicsRes = await topicAPI.getByCourse(courseId);
      const topicsData = (topicsRes.data || []).sort((a, b) => a.order_index - b.order_index);
      setTopics(topicsData);

      // Load videos for each topic
      const videosMap = {};
      const allVids = [];
      for (const topic of topicsData) {
        try {
          const videosRes = await videoAPI.getByTopic(topic.uuid_id);
          const sortedVideos = (videosRes.data || []).sort((a, b) => a.order_index - b.order_index);
          videosMap[topic.uuid_id] = sortedVideos;
          allVids.push(...sortedVideos.map(v => ({ ...v, topicId: topic.uuid_id })));
        } catch (error) {
          console.error(`Failed to load videos for topic ${topic.uuid_id}:`, error);
          videosMap[topic.uuid_id] = [];
        }
      }
      setVideos(videosMap);
      setAllVideos(allVids);

      // Load current video
      const currentVid = allVids.find(v => v.uuid_id === videoId);
      setCurrentVideo(currentVid);

      // Load progress
      try {
        const progressRes = await progressAPI.getCourse(courseId);
        if (progressRes.data?.completed_videos) {
          setCompletedVideos(new Set(progressRes.data.completed_videos));
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    } catch (error) {
      toast.error('Failed to load video');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setFullscreen(false);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Save progress periodically
  useEffect(() => {
    if (currentVideo && videoRef.current) {
      progressIntervalRef.current = setInterval(async () => {
        try {
          await progressAPI.updateVideo(currentVideo.uuid_id, {
            watch_time_seconds: Math.floor(currentTime),
            is_completed: currentTime / duration >= 0.9,
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }, 10000); // Save every 10 seconds

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [currentVideo, currentTime, duration]);

  // Mark complete when video finishes
  const handleVideoEnd = async () => {
    try {
      await progressAPI.markComplete(currentVideo.uuid_id);
      setCompletedVideos(prev => new Set([...prev, currentVideo.uuid_id]));
      toast.success('Video completed!');

      // Auto-play next video
      const currentIndex = allVideos.findIndex(v => v.uuid_id === videoId);
      if (currentIndex >= 0 && currentIndex < allVideos.length - 1) {
        const nextVideo = allVideos[currentIndex + 1];
        setTimeout(() => {
          navigate(`/student/courses/${courseId}/video/${nextVideo.uuid_id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to mark video as complete:', error);
    }
  };

  // Navigation
  const goToVideo = (newVideoId) => {
    navigate(`/student/courses/${courseId}/video/${newVideoId}`);
  };

  const goToPrevious = () => {
    const currentIndex = allVideos.findIndex(v => v.uuid_id === videoId);
    if (currentIndex > 0) {
      goToVideo(allVideos[currentIndex - 1].uuid_id);
    }
  };

  const goToNext = () => {
    const currentIndex = allVideos.findIndex(v => v.uuid_id === videoId);
    if (currentIndex >= 0 && currentIndex < allVideos.length - 1) {
      goToVideo(allVideos[currentIndex + 1].uuid_id);
    }
  };

  const currentIndex = allVideos.findIndex(v => v.uuid_id === videoId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allVideos.length - 1;

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading video..." />
      </DashboardLayout>
    );
  }

  if (!currentVideo) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center py-12">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Video not found</p>
            <Button className="mt-4" onClick={() => navigate(`/student/courses/${courseId}`)}>
              Back to Course
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(`/student/courses/${courseId}`)}
        >
          Back to Course
        </Button>

        <div className="flex gap-4">
          {/* Main Video Area */}
          <div className={`${showSidebar ? 'lg:w-2/3' : 'w-full'} space-y-4`}>
            {/* Video Player */}
            <Card className="p-0 overflow-hidden">
              <div id="video-container" className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={currentVideo.video_url}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnd}
                  onClick={togglePlay}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full mb-3 cursor-pointer"
                  />

                  {/* Controls */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      {/* Play/Pause */}
                      <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                        {playing ? <Pause size={24} /> : <Play size={24} />}
                      </button>

                      {/* Skip Buttons */}
                      <button onClick={() => skip(-10)} className="hover:scale-110 transition-transform">
                        <SkipBack size={20} />
                      </button>
                      <button onClick={() => skip(10)} className="hover:scale-110 transition-transform">
                        <SkipForward size={20} />
                      </button>

                      {/* Time Display */}
                      <span className="text-sm ml-2">
                        {formatDuration(currentTime)} / {formatDuration(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Volume Control */}
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="hover:scale-110 transition-transform">
                          {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={muted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 cursor-pointer"
                        />
                      </div>

                      {/* Fullscreen */}
                      <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                        {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Info */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {currentVideo.title}
                    </h1>
                    {currentVideo.description && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentVideo.description}
                      </p>
                    )}
                  </div>
                  {completedVideos.has(currentVideo.uuid_id) && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Completed
                    </Badge>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    leftIcon={<ChevronLeft size={18} />}
                    onClick={goToPrevious}
                    disabled={!hasPrevious}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Video {currentIndex + 1} of {allVideos.length}
                  </span>

                  <Button
                    variant="outline"
                    rightIcon={<ChevronRight size={18} />}
                    onClick={goToNext}
                    disabled={!hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Playlist */}
          {showSidebar && (
            <div className="hidden lg:block lg:w-1/3">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Course Content
                  </h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {topics.map((topic, topicIndex) => {
                    const topicVideos = videos[topic.uuid_id] || [];

                    return (
                      <div key={topic.uuid_id} className="space-y-1">
                        {/* Topic Header */}
                        <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-semibold">
                            {topicIndex + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {topic.title}
                          </span>
                        </div>

                        {/* Videos */}
                        {topicVideos.map((video, videoIndex) => {
                          const isActive = video.uuid_id === videoId;
                          const isCompleted = completedVideos.has(video.uuid_id);

                          return (
                            <button
                              key={video.uuid_id}
                              onClick={() => goToVideo(video.uuid_id)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 mt-1">
                                  {isCompleted ? (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                  ) : (
                                    <Play size={16} className="text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isActive
                                      ? 'text-primary-600 dark:text-primary-400'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`}>
                                    {videoIndex + 1}. {video.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDuration(video.duration)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Show Sidebar Button */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
            >
              <List size={20} />
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
