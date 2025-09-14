'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KnowledgeEntry {
  id?: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
}

const categories = [
  'About Company',
  'Services',
  'Pricing',
  'Process',
  'Team',
  'Success Stories',
  'FAQ',
  'Contact'
];

export default function KnowledgeManagementPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState<KnowledgeEntry>({
    title: '',
    content: '',
    category: 'About Company',
    keywords: []
  });
  const router = useRouter();

  useEffect(() => {
    const storedPassword = sessionStorage.getItem('adminPassword');
    if (storedPassword) {
      setAdminPassword(storedPassword);
      setIsAuthenticated(true);
      fetchKnowledgeEntries();
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      sessionStorage.setItem('adminPassword', passwordInput);
      setAdminPassword(passwordInput);
      setIsAuthenticated(true);
      fetchKnowledgeEntries();
    } else {
      alert('Invalid password');
    }
  };

  const fetchKnowledgeEntries = async () => {
    // This would fetch from your API
    // For now, using placeholder data
    setEntries([
      {
        id: '1',
        title: 'About Our Company',
        content: 'We are a leading technology consulting firm specializing in AI solutions...',
        category: 'About Company',
        keywords: ['consulting', 'AI', 'technology']
      },
      {
        id: '2',
        title: 'Our Services',
        content: 'We offer comprehensive AI consulting, development, and implementation services...',
        category: 'Services',
        keywords: ['services', 'consulting', 'development']
      }
    ]);
  };

  const handleSaveEntry = async () => {
    if (!newEntry.title || !newEntry.content) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would call your API to save the entry
    console.log('Saving entry:', newEntry);

    // Add to local state for now
    setEntries([...entries, { ...newEntry, id: Date.now().toString() }]);

    // Reset form
    setNewEntry({
      title: '',
      content: '',
      category: 'About Company',
      keywords: []
    });

    alert('Knowledge entry saved successfully!');
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold">Admin Authentication</h1>
              <p className="text-muted-foreground">
                Enter the admin password to manage knowledge base
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
          <h1 className="text-3xl font-bold">Knowledge Base Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage company information, services, FAQs, and success stories
          </p>
        </div>

        {/* Add New Entry Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Knowledge Entry</CardTitle>
            <CardDescription>
              Add information about your company that the chatbot can use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="e.g., Our Mission Statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Enter the detailed information..."
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
              <Input
                value={newEntry.keywords.join(', ')}
                onChange={(e) => setNewEntry({
                  ...newEntry,
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                })}
                placeholder="e.g., pricing, services, consultation"
              />
            </div>

            <Button onClick={handleSaveEntry} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </CardContent>
        </Card>

        {/* Existing Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No knowledge entries yet. Add your first entry above.
                </p>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {entry.category}
                          </span>
                          <h4 className="font-medium">{entry.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {entry.content}
                        </p>
                        {entry.keywords.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {entry.keywords.map((keyword, i) => (
                              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}