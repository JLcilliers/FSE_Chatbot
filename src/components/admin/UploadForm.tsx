'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFormProps {
  onSuccess?: (shareUrl: string) => void;
  adminPassword: string;
}

export function UploadForm({ onSuccess, adminPassword }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const fileType = selectedFile.type;
      if (!fileType.includes('pdf') && !fileType.includes('docx')) {
        setError('Only PDF and DOCX files are supported');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file || !title || !clientName) {
      setError('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('clientName', clientName);

    try {
      setUploadProgress(40);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminPassword}`,
        },
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);
      setUploadStatus('success');
      setShareUrl(data.proposal.shareUrl);

      if (onSuccess) {
        onSuccess(data.proposal.shareUrl);
      }

      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setClientName('');
        setUploadStatus('idle');
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Proposal</CardTitle>
        <CardDescription>
          Upload a PDF or DOCX file to create an AI-powered chatbot for your proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Proposal Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter proposal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <div>
            <label htmlFor="clientName" className="block text-sm font-medium mb-2">
              Client Name
            </label>
            <Input
              id="clientName"
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium mb-2">
              Proposal File
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {uploadProgress > 0 && uploadStatus === 'uploading' && (
            <div>
              <Progress value={uploadProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Uploading and processing document...
              </p>
            </div>
          )}

          {uploadStatus === 'success' && shareUrl && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Upload successful!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Share URL: {shareUrl}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isUploading || !file || !title || !clientName}
            className="w-full"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Proposal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}