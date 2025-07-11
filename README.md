# Document Agent - AI-Powered Document Processing Web App

A modern web application for uploading, processing, and chatting with documents using AI. Built with React, TypeScript, Supabase, and Vite.

## 🚀 Features

### 📄 Document Management
- **File Upload**: Drag & drop or click to upload documents (PDF, DOCX, TXT)
- **Document Library**: View all uploaded documents with metadata
- **File Operations**: View, download, and delete documents
- **Storage**: Secure cloud storage with Supabase

### 🤖 AI Chat Interface
- **Document Chat**: Ask questions about your uploaded documents
- **Persistent Chat History**: Conversations are saved and persist across sessions
- **Document-Specific Chats**: Each document maintains its own chat history
- **Real-time Responses**: Get instant AI-powered answers

### 🔐 Authentication & Security
- **User Authentication**: Secure login/signup with Supabase Auth
- **Protected Routes**: User-specific document access
- **Row Level Security**: Database-level security policies

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Mode**: Theme switching capability
- **Loading States**: Skeleton loaders and smooth transitions
- **Toast Notifications**: User feedback for actions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: TanStack Query + React Hooks
- **Routing**: React Router DOM
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Backend API (for document processing)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd doc_agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=your_backend_api_url
```

### 4. Database Setup
Apply the required database migrations:

```bash
cd supabase
npx supabase db push
```

Or manually run the SQL migrations in your Supabase dashboard:
- `supabase/manual_migration.sql` (Document mappings)
- `supabase/manual_chat_migration.sql` (Chat messages)

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions and services
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Authentication with email/password
3. Create a storage bucket named `documents`
4. Set up Row Level Security policies
5. Add your domain to Auth redirect URLs

### Vercel Deployment
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with `npm run build`

## 📱 Usage

### Getting Started
1. **Sign Up/Login**: Create an account or sign in
2. **Upload Documents**: Go to Documents page and upload files
3. **Chat with Documents**: Select a document and start asking questions
4. **Manage Library**: View, download, or delete documents

### Features Overview
- **Dashboard**: Overview of your documents and recent activity
- **Documents**: Upload and process new documents
- **Library**: Manage all your uploaded documents
- **Settings**: Configure your account preferences

## 🔒 Security Features

- **Authentication**: Secure user authentication with Supabase
- **Authorization**: User-specific document access
- **Data Protection**: Row Level Security in database
- **Secure Storage**: Encrypted file storage
- **API Security**: Protected backend endpoints

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Environment Variables for Production
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_BACKEND_URL`: Your backend API URL

## 🐛 Troubleshooting

### Common Issues

**Authentication Redirects**
- Ensure all Vercel domains are added to Supabase Auth redirect URLs
- Remove any spaces from URLs in Supabase settings

**Document Upload Issues**
- Check Supabase storage bucket permissions
- Verify RLS policies are correctly configured

**Chat Not Working**
- Ensure backend API is running and accessible
- Check document mapping table exists and has data
- Verify chat messages table is properly set up

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the documentation files
- Open an issue on GitHub

---

Built with ❤️ using modern web technologies