import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../common';
import { certificateAPI } from '../../api';
import { Award, CheckCircle, Clock, Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificateEligibility({ courseId, courseTitle }) {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (courseId) {
      checkEligibility();
    }
  }, [courseId]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const response = await certificateAPI.checkEligibility(courseId);
      setEligibility(response.data);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await certificateAPI.claimCertificate(courseId);
      toast.success('Certificate claimed successfully!');
      checkEligibility(); // Refresh eligibility
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to claim certificate';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setClaiming(false);
    }
  };

  const handleShare = (certificate) => {
    const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.code}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success('Verification link copied to clipboard!');
  };

  const handleDownload = (certificate) => {
    if (certificate.url) {
      window.open(certificate.url, '_blank');
      toast.success('Certificate opened in new tab');
    } else {
      toast.error('Certificate file not available');
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking eligibility...</p>
        </div>
      </Card>
    );
  }

  if (!eligibility) {
    return null;
  }

  // If certificate already exists
  if (eligibility.certificate) {
    const certificate = eligibility.certificate;
    return (
      <Card className="border-2 border-green-200 dark:border-green-800">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Certificate Earned!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Congratulations on completing this course
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  <CheckCircle size={14} className="mr-1" />
                  Issued
                </Badge>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Course</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {courseTitle}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Issued On</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Verification Code</p>
                <p className="font-mono font-bold text-gray-900 dark:text-gray-100">
                  {certificate.code}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {certificate.url && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload(certificate)}
                leftIcon={<Download size={16} />}
                className="flex-1"
              >
                Download Certificate
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare(certificate)}
              leftIcon={<Share2 size={16} />}
            >
              Share
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // If eligible but not claimed yet
  if (eligibility.eligible) {
    return (
      <Card className="border-2 border-primary-200 dark:border-primary-800">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg shadow-md">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Certificate Available!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You've completed this course and earned a certificate
              </p>
            </div>
          </div>

          {/* Completion Info */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Course Completion</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {eligibility.completion_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${eligibility.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Claim Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={handleClaim}
            disabled={claiming}
            leftIcon={<Award size={20} />}
            className="py-3"
          >
            {claiming ? 'Claiming Certificate...' : 'Claim Your Certificate'}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Click to generate your certificate. You'll be able to download and share it.
          </p>
        </div>
      </Card>
    );
  }

  // Not eligible yet
  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Clock className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Certificate Progress
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete the course to earn your certificate
            </p>
          </div>
        </div>

        {/* Progress Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Course Completion</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {eligibility.completion_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${eligibility.completion_percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {100 - Math.round(eligibility.completion_percentage)}% remaining to unlock certificate
          </p>
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To earn your certificate:
          </p>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              {eligibility.completion_percentage === 100 ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <Clock size={16} className="text-gray-400" />
              )}
              <span>Complete all videos in the course</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>Watch videos till the end</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
