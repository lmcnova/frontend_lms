import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from './store';

// Security Protection
import SecurityProvider from './components/security/SecurityProvider';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import RegisterAdmin from './pages/auth/RegisterAdmin';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Dashboard Components
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import DebugAuth from './pages/DebugAuth';

// Admin Pages
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminCourses from './pages/admin/Courses';
import AdminDepartments from './pages/admin/Departments';
import CourseTopics from './pages/admin/CourseTopics';
import TopicVideos from './pages/admin/TopicVideos';
import AdminCertificates from './pages/admin/Certificates';
import AdminDeviceRequests from './pages/admin/DeviceRequests';
import AdminSettings from './pages/admin/Settings';

// Student Pages
import StudentMyCourses from './pages/student/MyCourses';
import StudentCourseView from './pages/student/CourseView';
import VideoPlayer from './pages/student/VideoPlayer';
import StudentProgress from './pages/student/Progress';
import StudentCertificates from './pages/student/Certificates';
import StudentDeviceRequests from './pages/student/DeviceRequests';
import StudentSettings from './pages/student/Settings';

// Teacher Pages
import TeacherCourses from './pages/teacher/Courses';

// Public Pages
import VerifyCertificate from './pages/public/VerifyCertificate';

// Placeholder for other pages
function ComingSoon({ title }) {
  return (
    <DashboardLayout>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page is under construction
        </p>
      </div>
    </DashboardLayout>
  );
}

function App() {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, [initializeAuth, initializeTheme]);

  // Get role-based dashboard route
  const getDashboardRoute = () => {
    if (!user || !user.role) {
      console.log('⚠️ No user or role found, redirecting to login');
      return '/login';
    }

    console.log(`📍 Getting dashboard route for role: ${user.role}`);

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        console.log('⚠️ Unknown role:', user.role);
        return '/login';
    }
  };

  return (
    <SecurityProvider enableWatermark={false}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardRoute()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register/admin" element={<RegisterAdmin />} />
        <Route path="/register/student" element={<ComingSoon title="Student Registration" />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />
        <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourseView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:courseId/video/:videoId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <VideoPlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/progress"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/certificates"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCertificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/device-requests"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDeviceRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ComingSoon title="Student Portal" />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ComingSoon title="Teacher Portal" />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminTeachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId/topics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CourseTopics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId/topics/:topicId/videos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TopicVideos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/certificates"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCertificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/device-requests"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDeviceRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon title="Admin Portal" />
          </ProtectedRoute>
        }
      />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SecurityProvider>
  );
}

export default App;
