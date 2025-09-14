'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadForm } from '@/components/admin/UploadForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminUploadPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated
  const router = useRouter();

  useEffect(() => {
    // No authentication needed - always authenticated
    setIsAuthenticated(true);
  }, []);

  // No password needed
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleUploadSuccess = (shareUrl: string) => {
    // Optionally redirect to the proposal or show a success message
    console.log('Upload successful! Share URL:', shareUrl);
  };

  // No authentication needed - removed password check

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
            onSuccess={handleUploadSuccess}
          />
        </div>
      </div>
    </div>
  );
}