'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Plus,
  Trash2,
  Save,
  Loader2,
  FileUp,
  Database,
  AlertCircle
} from 'lucide-react';

interface KnowledgeEntry {
  id?: string;
  title: string;
  content: string;
  category: 'general' | 'services' | 'pricing' | 'team' | 'process' | 'faq';
  source?: string;
}

export default function KnowledgeUploadPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState('');

  const handleAuth = () => {
    if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Authenticated successfully');
    } else {
      toast.error('Invalid password');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!validTypes.some(type => file.type.includes(type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('extractOnly', 'true');

    try {
      const response = await fetch('/api/knowledge/extract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminPassword}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract content');
      }

      const data = await response.json();
      setExtractedContent(data.content);

      // Auto-create entries from extracted content
      const sections = data.content.split(/\n\n+/).filter((s: string) => s.trim().length > 100);
      const newEntries: KnowledgeEntry[] = sections.slice(0, 5).map((section: string, index: number) => ({
        title: `Section ${index + 1} from ${file.name}`,
        content: section.trim(),
        category: 'general' as const,
        source: file.name
      }));

      setEntries(prev => [...prev, ...newEntries]);
      toast.success(`Extracted ${newEntries.length} sections from ${file.name}`);
    } catch (error) {
      console.error('Error extracting content:', error);
      toast.error('Failed to extract content from file');
    } finally {
      setIsUploading(false);
    }
  };

  const addEntry = () => {
    setEntries([...entries, {
      title: '',
      content: '',
      category: 'general',
      source: uploadedFile?.name || 'Manual Entry'
    }]);
  };

  const updateEntry = (index: number, field: keyof KnowledgeEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const saveAllEntries = async () => {
    if (entries.length === 0) {
      toast.error('No entries to save');
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/knowledge/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`,
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error('Failed to save entries');
      }

      toast.success(`Saved ${entries.length} knowledge entries`);
      setEntries([]);
      setExtractedContent('');
      setUploadedFile(null);
    } catch (error) {
      console.error('Error saving entries:', error);
      toast.error('Failed to save knowledge entries');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Admin Authentication</h2>
          <Input
            type="password"
            placeholder="Enter admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />
          <Button onClick={handleAuth} className="w-full mt-4">
            Authenticate
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            Knowledge Base Upload Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload PDFs or Word documents to extract and add company information to the chatbot&apos;s knowledge base
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Document Upload
          </h2>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {isUploading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              )}
              <span className="text-lg font-medium">
                {isUploading ? 'Extracting content...' : 'Click to upload or drag and drop'}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                PDF, Word documents, or text files
              </span>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="flex-1">{uploadedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          {extractedContent && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  Extracted content preview (first 500 characters):
                </span>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {extractedContent.substring(0, 500)}...
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Knowledge Entries */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Knowledge Entries</h2>
            <Button onClick={addEntry} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No entries yet. Upload a document or add entries manually.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Input
                      placeholder="Entry title"
                      value={entry.title}
                      onChange={(e) => updateEntry(index, 'title', e.target.value)}
                      className="flex-1 mr-2"
                    />
                    <select
                      value={entry.category}
                      onChange={(e) => updateEntry(index, 'category', e.target.value as any)}
                      className="px-3 py-2 border rounded-md mr-2"
                    >
                      <option value="general">General</option>
                      <option value="services">Services</option>
                      <option value="pricing">Pricing</option>
                      <option value="team">Team</option>
                      <option value="process">Process</option>
                      <option value="faq">FAQ</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Entry content"
                    value={entry.content}
                    onChange={(e) => updateEntry(index, 'content', e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                  {entry.source && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {entry.source}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {entries.length > 0 && (
            <Button
              onClick={saveAllEntries}
              disabled={isUploading}
              className="w-full mt-6"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save All Entries to Knowledge Base
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}