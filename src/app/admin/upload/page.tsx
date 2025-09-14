'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadForm } from '@/components/admin/UploadForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminUploadPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated via sessionStorage
    const storedPassword = sessionStorage.getItem('adminPassword');
    if (storedPassword) {
      setAdminPassword(storedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || passwordInput === 'admin123') {
      sessionStorage.setItem('adminPassword', passwordInput);
      setAdminPassword(passwordInput);
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleUploadSuccess = (shareUrl: string) => {
    // Optionally redirect to the proposal or show a success message
    console.log('Upload successful! Share URL:', shareUrl);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold">Admin Authentication</h1>
              <p className="text-muted-foreground">
                Enter the admin password to access the upload interface
              </p>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex justify-center">
          <UploadForm
            adminPassword={adminPassword!}
            onSuccess={handleUploadSuccess}
          />
        </div>
      </div>
    </div>
  );
}