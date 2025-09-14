import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Upload, MessageSquare, Share2, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            FSE Proposal Chatbot
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your business proposals into intelligent, interactive chatbots.
            Let AI answer client questions about your services, pricing, and offerings 24/7.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/admin/dashboard">
              <Button size="lg">
                Admin Dashboard
              </Button>
            </Link>
            <Link href="/admin/upload">
              <Button size="lg" variant="outline">
                Upload Proposal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload your PDF or DOCX proposal through our secure admin interface
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our AI analyzes your proposal and creates an intelligent knowledge base
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Share</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get a unique link to share with clients for instant access to the chatbot
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Each proposal is protected with unique tokens and secure access controls
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Transform your proposals into interactive experiences today
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/upload">
              <Button size="lg" className="px-8">
                Upload Your First Proposal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
