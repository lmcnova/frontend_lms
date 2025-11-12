import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Input, Badge, LoadingSpinner } from '../../components/common';
import { certificateAPI } from '../../api';
import { Award, CheckCircle, XCircle, Search, Calendar, User, BookOpen, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyCertificate() {
  const { code: urlCode } = useParams();
  const [code, setCode] = useState(urlCode || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e?.preventDefault();

    if (!code.trim()) {
      toast.error('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await certificateAPI.verify(code.trim());
      setCertificate(response.data);
      toast.success('Certificate verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.detail || 'Certificate not found or invalid';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if code is in URL
  useState(() => {
    if (urlCode) {
      handleVerify();
    }
  }, [urlCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-6">
            <Shield className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Certificate Verification
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Verify the authenticity of educational certificates
          </p>
        </div>

        {/* Search Form */}
        <Card className="shadow-xl">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Verification Code
              </label>
              <div className="flex gap-3">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g., ABC123DE"
                  className="flex-1 text-lg font-mono"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  leftIcon={<Search size={20} />}
                  disabled={loading || !code.trim()}
                  className="px-8"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                The verification code can be found on the certificate document
              </p>
            </div>
          </form>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="shadow-xl">
            <div className="py-12 text-center">
              <LoadingSpinner text="Verifying certificate..." />
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="shadow-xl border-2 border-red-200 dark:border-red-800">
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Certificate Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please check the verification code and try again
              </p>
            </div>
          </Card>
        )}

        {/* Success State - Certificate Details */}
        {certificate && !loading && (
          <Card className="shadow-xl border-2 border-green-200 dark:border-green-800">
            {/* Verification Status Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 -m-6 mb-6 rounded-t-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  {certificate.revoked ? (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {certificate.revoked ? 'Certificate Revoked' : 'Certificate Verified'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {certificate.revoked
                      ? 'This certificate has been revoked and is no longer valid'
                      : 'This is an authentic certificate'}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Visual */}
            <div className="aspect-[4/3] bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-8 rounded-lg mb-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 border-8 border-yellow-400 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-8 border-yellow-400 rounded-full translate-x-16 translate-y-16"></div>
              </div>

              <Award className="w-24 h-24 text-yellow-600 dark:text-yellow-400 mb-4 relative z-10" />
              <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 relative z-10 mb-2">
                {certificate.course_title}
              </h3>
              <p className="text-lg text-yellow-800 dark:text-yellow-200 relative z-10">
                Certificate of Completion
              </p>
              <div className="mt-4 px-6 py-2 bg-white dark:bg-gray-900 rounded-full shadow-md relative z-10">
                <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                  {certificate.code}
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Student Name</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {certificate.student_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {certificate.course_title}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Issued On</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <div className="mt-1">
                      {certificate.revoked ? (
                        <Badge variant="danger">
                          Revoked
                          {certificate.revoked_at && ` on ${new Date(certificate.revoked_at).toLocaleDateString()}`}
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle size={14} className="mr-1" />
                          Valid & Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {certificate.completion_percentage && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Course Completion</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {certificate.completion_percentage}%
                    </span>
                  </div>
                </div>
              )}

              {certificate.notes && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Notes:</strong> {certificate.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Certificate ID */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Certificate ID: {certificate.certificate_id}
              </p>
            </div>
          </Card>
        )}

        {/* Information Card */}
        {!certificate && !loading && !error && (
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                How to Verify a Certificate
              </h3>
              <ol className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary-600 dark:text-primary-400">1.</span>
                  <span>Locate the verification code on the certificate document</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary-600 dark:text-primary-400">2.</span>
                  <span>Enter the code in the search box above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary-600 dark:text-primary-400">3.</span>
                  <span>Click "Verify" to check the certificate's authenticity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary-600 dark:text-primary-400">4.</span>
                  <span>View the certificate details and verification status</span>
                </li>
              </ol>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
