import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/common';
import { STORAGE_KEYS } from '../utils/constants';

export default function DebugAuth() {
  const { user, token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

  const clearAuth = () => {
    localStorage.clear();
    window.location.reload();
  };

  const testNavigate = (path) => {
    navigate(path, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          🔍 Auth Debug Page
        </h1>

        {/* Zustand Store State */}
        <Card title="Zustand Store State">
          <div className="space-y-2">
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User Role:</strong> {user?.role || '❌ Not set'}</p>
            <p><strong>User Email:</strong> {user?.email_id || '❌ Not set'}</p>
            <p><strong>Token (first 50 chars):</strong> {token?.substring(0, 50) || '❌ Not set'}</p>

            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">Full User Object</summary>
              <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        </Card>

        {/* LocalStorage State */}
        <Card title="LocalStorage State">
          <div className="space-y-2">
            <p><strong>Stored Token (first 50 chars):</strong></p>
            <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
              {storedToken?.substring(0, 50) || '❌ Not found'}
            </code>

            <p className="mt-4"><strong>Stored User:</strong></p>
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
              {storedUser || '❌ Not found'}
            </pre>
          </div>
        </Card>

        {/* Actions */}
        <Card title="Test Actions">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => testNavigate('/admin/dashboard')} variant="outline">
              Test Admin Dashboard
            </Button>
            <Button onClick={() => testNavigate('/teacher/dashboard')} variant="outline">
              Test Teacher Dashboard
            </Button>
            <Button onClick={() => testNavigate('/student/dashboard')} variant="outline">
              Test Student Dashboard
            </Button>
            <Button onClick={() => testNavigate('/login')} variant="outline">
              Go to Login
            </Button>
            <Button onClick={clearAuth} variant="danger">
              Clear All Auth Data
            </Button>
          </div>
        </Card>

        {/* Navigation Info */}
        <Card title="Current Route Info">
          <div className="space-y-2">
            <p><strong>Current Path:</strong> {window.location.pathname}</p>
            <p><strong>Full URL:</strong> {window.location.href}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
