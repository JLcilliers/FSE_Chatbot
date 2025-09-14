# FSE Proposal Chatbot

Transform your business proposals into intelligent, interactive chatbots powered by AI.

## Features

- **PDF/DOCX Upload**: Upload business proposals in PDF or DOCX format
- **AI-Powered Chat**: Intelligent chatbot that answers questions about your proposals
- **RAG System**: Retrieval-Augmented Generation for accurate, context-aware responses
- **Secure Sharing**: Unique share tokens for each proposal
- **Admin Dashboard**: Manage all uploaded proposals
- **Real-time Streaming**: Fast, streaming chat responses
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes, Vercel AI SDK
- **Database**: Supabase with pgvector extension
- **AI Models**: Anthropic Claude (chat), OpenAI (embeddings)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account with a project
- Anthropic API key
- OpenAI API key
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fse-chatbot.git
cd fse-chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration script from `migrations/supabase-schema.sql`
3. Enable the pgvector extension
4. Create a storage bucket named "proposals" (make it public)

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the variables with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# Admin Configuration
ADMIN_PASSWORD=your_secure_admin_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Admin Interface

1. Navigate to `/admin/dashboard` or `/admin/upload`
2. Enter the admin password (default: admin123)
3. Upload a PDF or DOCX proposal
4. Get a shareable link for clients

### Client Interface

1. Open the shared link
2. View the proposal document
3. Click "Ask Questions" to open the chatbot
4. Ask questions about the proposal content

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy

### 3. Update Environment Variables

In Vercel dashboard, update `NEXT_PUBLIC_APP_URL` to your production URL.

## API Endpoints

- `POST /api/upload` - Upload proposal (admin only)
- `POST /api/chat` - Chat with proposal
- `GET /api/proposals` - List proposals (admin) or get by token
- `DELETE /api/proposals` - Delete proposal (admin only)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── proposal/          # Proposal viewer
│   └── api/               # API routes
├── components/            # React components
│   ├── chat/             # Chat interface
│   ├── admin/            # Admin components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── ai/               # AI/RAG implementation
│   ├── pdf/              # Document processing
│   └── supabase/         # Database client
└── types/                 # TypeScript types
```

## Security Considerations

- Admin password protection for upload interface
- Unique share tokens for each proposal
- File validation (type and size)
- Environment variables for sensitive data
- Rate limiting on chat API (implement as needed)

## Troubleshooting

### Common Issues

1. **Upload fails**: Check file size (max 10MB) and type (PDF/DOCX only)
2. **Chat not responding**: Verify API keys are correct
3. **Database errors**: Ensure Supabase schema is properly set up
4. **Vector search not working**: Confirm pgvector extension is enabled

### Debug Mode

Set `NODE_ENV=development` for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact support.
