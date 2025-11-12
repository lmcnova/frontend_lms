import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { certificateAPI, courseAPI } from '../../api';
import { Award, Download, ExternalLink, Calendar, Share2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      // Get certificates using the new API
      const certificatesRes = await certificateAPI.getMyCertificates();
      const certificatesData = certificatesRes.data || [];
      setCertificates(certificatesData);

      // Load course details
      const coursesMap = {};
      for (const cert of certificatesData) {
        try {
          const courseRes = await courseAPI.getById(cert.course_uuid);
          coursesMap[cert.course_uuid] = courseRes.data;
        } catch (error) {
          console.error('Failed to load course:', error);
        }
      }
      setCourses(coursesMap);
    } catch (error) {
      toast.error('Failed to load certificates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate, courseName) => {
    try {
      if (certificate.url) {
        // Direct download from S3 URL
        window.open(certificate.url, '_blank');
        toast.success('Certificate opened in new tab');
      } else {
        toast.error('Certificate file not available');
      }
    } catch (error) {
      toast.error('Failed to download certificate');
      console.error(error);
    }
  };

  const handleView = async (certificate) => {
    try {
      if (certificate.url) {
        window.open(certificate.url, '_blank');
      } else {
        toast.error('Certificate file not available');
      }
    } catch (error) {
      toast.error('Failed to view certificate');
      console.error(error);
    }
  };

  const handleShare = (certificate) => {
    const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.code}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success('Verification link copied to clipboard!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen text="Loading your certificates..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Certificates
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
          </p>
        </div>

        {/* Stats */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {certificates.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Certificates</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {certificates.filter(c => c.downloaded_at).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Downloaded</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Date().getFullYear()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Year</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Certificates List */}
        <Card>
          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Certificates Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete courses to earn certificates
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Certificates are automatically generated when you complete a course with 100% progress
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates
                .sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at))
                .map((certificate) => {
                  const course = courses[certificate.course_uuid];

                  return (
                    <div
                      key={certificate.uuid_id}
                      className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      {/* Certificate Visual */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 left-0 w-32 h-32 border-8 border-yellow-400 rounded-full -translate-x-16 -translate-y-16"></div>
                          <div className="absolute bottom-0 right-0 w-32 h-32 border-8 border-yellow-400 rounded-full translate-x-16 translate-y-16"></div>
                        </div>

                        <Award className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mb-3 relative z-10" />
                        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 relative z-10 line-clamp-2">
                          {course?.title || 'Course Certificate'}
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 relative z-10">
                          Certificate of Completion
                        </p>
                      </div>

                      {/* Certificate Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            {certificate.revoked ? (
                              <Badge variant="danger" size="sm">
                                Revoked
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">
                                <CheckCircle size={14} className="mr-1" />
                                Active
                              </Badge>
                            )}
                            {course && (
                              <Badge variant="secondary" size="sm">
                                {course.level}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Issued:</strong> {formatDate(certificate.issued_at)}
                          </p>
                          {certificate.code && (
                            <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 rounded p-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Verification Code
                              </p>
                              <p className="text-xs font-mono font-bold text-gray-900 dark:text-gray-100">
                                {certificate.code}
                              </p>
                            </div>
                          )}
                          {certificate.completion_percentage && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Completion: <span className="font-semibold text-green-600">
                                {certificate.completion_percentage}%
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {certificate.url ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleDownload(certificate, course?.title || 'Certificate')}
                                leftIcon={<Download size={16} />}
                                className="flex-1"
                              >
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(certificate)}
                                leftIcon={<ExternalLink size={16} />}
                              >
                                View
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="flex-1"
                            >
                              File Not Available
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(certificate)}
                            leftIcon={<Share2 size={16} />}
                          >
                            Share
                          </Button>
                        </div>

                        {certificate.revoked_at && (
                          <p className="text-xs text-red-500 dark:text-red-400 text-center">
                            Revoked on {formatDate(certificate.revoked_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        {/* Info Section */}
        {certificates.length === 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                How to Earn Certificates
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>Complete all videos in a course to achieve 100% progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>Certificates are automatically generated upon course completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>Download and share your certificates to showcase your achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>Each certificate includes a unique verification number</span>
                </li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
