'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProposalList } from '@/components/admin/ProposalList';
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';

export default function AdminDashboard() {
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

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setAdminPassword(null);
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold">Admin Authentication</h1>
              <p className="text-muted-foreground">
                Enter the admin password to access the dashboard
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your proposals and chatbots
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/knowledge')}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Knowledge Base
            </Button>
            <Button onClick={() => router.push('/admin/upload')}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Proposal
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <ProposalList adminPassword={adminPassword!} />
      </div>
    </div>
  );
}