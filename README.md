# 🏛️ LegalLens AI - AI-Powered Legal Document Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

> **AI-powered legal document analyzer for freelancers, startups, and small businesses**

## 🌐 Live Demo

**🚀 Try LegalLens AI Live:** [https://legalens.felixify.in](https://legalens.felixify.in)

## 🔗 Repository Links

- **Frontend (Next.js):** [https://github.com/Amit00008/legal-lens](https://github.com/Amit00008/legal-lens) - This repository
- **Backend (Python ML):** [https://github.com/Amit00008/LegalLens](https://github.com/Amit00008/LegalLens) - Python ML server and AI models

> **💡 Want to contribute?** Check out our Python ML backend repository for AI model improvements and server enhancements!

LegalLens AI is a sophisticated web application that uses artificial intelligence to analyze legal documents, contracts, and agreements. It provides instant insights, risk detection, and expert recommendations to help users understand complex legal documents without requiring legal expertise.

## 🌟 Features

### 🔍 **Core Analysis Capabilities**
- **AI-Powered Document Processing**: Upload PDF and DOCX files for instant analysis
- **Smart Risk Detection**: Automatically identify potential legal risks and problematic clauses
- **Comprehensive Summaries**: Get clear, concise summaries of complex legal documents
- **Category Classification**: Documents are automatically organized by legal topics and sections
- **Expert Questions**: AI-generated questions to ask legal professionals for deeper review

### 📊 **Risk Assessment**
- **Risk Scoring**: 0-100 scale with detailed breakdown
- **Risk Categories**: Payment Terms, Liability, Termination, Confidentiality, Dispute Resolution
- **Visual Risk Indicators**: Color-coded risk levels (High, Medium, Low)
- **Detailed Findings**: Specific clause analysis with recommendations

### 🛡️ **Security & Privacy**
- **End-to-End Encryption**: All data is encrypted in transit and at rest
- **Secure Authentication**: Supabase Auth with email/password and social login
- **Data Retention**: Documents auto-deleted after 30 days (configurable)
- **Privacy Controls**: User-controlled data retention and deletion settings
- **GDPR Compliant**: Full compliance with data protection regulations

### 📱 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Processing**: Live status updates during document analysis
- **Interactive Dashboard**: Comprehensive overview of all documents and analyses
- **Share Functionality**: Generate shareable links for collaborative review
- **PDF Reports**: Download comprehensive analysis reports

### 🔧 **Technical Features**
- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Real-time Updates**: Live status updates and notifications
- **File Management**: Secure file upload and storage with Vercel Blob
- **API Integration**: RESTful API for external integrations
- **Performance Optimized**: Fast loading and efficient processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amit00008/LegalLens.git
   cd LegalLens
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   # Optional: Analytics
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   ```

4. **Database Setup**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create documents table
   CREATE TABLE documents (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     file_path TEXT NOT NULL,
     status TEXT DEFAULT 'processing',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     processed_at TIMESTAMP WITH TIME ZONE
   );

   -- Create analysis_results table
   CREATE TABLE analysis_results (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
     summary TEXT,
     risk_score TEXT,
     risks_detected JSONB,
     categories JSONB,
     suggested_questions JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own documents" ON documents
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own documents" ON documents
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own documents" ON documents
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own documents" ON documents
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own analysis results" ON analysis_results
     FOR SELECT USING (
       auth.uid() = (
         SELECT user_id FROM documents WHERE id = analysis_results.document_id
       )
     );

   CREATE POLICY "Users can insert own analysis results" ON analysis_results
     FOR INSERT WITH CHECK (
       auth.uid() = (
         SELECT user_id FROM documents WHERE id = analysis_results.document_id
       )
     );
   ```

5. **Storage Setup**
   Create a storage bucket named `pdfs` in your Supabase dashboard with the following policy:
   ```sql
   CREATE POLICY "Users can upload own files" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]
     );

   CREATE POLICY "Users can view own files" ON storage.objects
     FOR SELECT USING (
       bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]
     );

   CREATE POLICY "Users can delete own files" ON storage.objects
     FOR DELETE USING (
       bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]
     );
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
legal-lens/
├── app/                          # Next.js 15 App Router
│   ├── analysis/[id]/            # Analysis detail pages
│   ├── api/                      # API routes
│   │   ├── analyze/              # Document analysis endpoint
│   │   ├── analyze-background/   # Background processing
│   │   ├── generate-report/      # PDF report generation
│   │   ├── generate-report-blob/ # Blob storage reports
│   │   └── share-analysis/       # Share functionality
│   ├── dashboard/                # User dashboard
│   ├── login/                    # Authentication pages
│   ├── privacy/                  # Privacy policy
│   ├── shared/analysis/[id]/     # Shared analysis views
│   ├── signup/                   # User registration
│   ├── support/                  # Support page
│   └── upload/                   # Document upload
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui components
│   ├── auth-provider.tsx        # Authentication context
│   ├── navbar.tsx               # Navigation component
│   └── theme-provider.tsx       # Theme management
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client functions
│   ├── auth.ts                  # Authentication utilities
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # General utilities
├── middleware.ts                # Next.js middleware
├── public/                      # Static assets
└── styles/                      # Global styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

### Database Schema

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

#### Analysis Results Table
```sql
CREATE TABLE analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  summary TEXT,
  risk_score TEXT,
  risks_detected JSONB,
  categories JSONB,
  suggested_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Configure environment variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure Supabase and Vercel Blob tokens are set

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t legal-lens .
   docker run -p 3000:3000 legal-lens
   ```

## 📊 API Reference

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

#### POST `/api/auth/signin`
Sign in existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Document Management

#### POST `/api/analyze`
Upload and analyze a document.

**Request Body:**
```json
{
  "file": "base64_encoded_file",
  "title": "Contract Analysis"
}
```

**Response:**
```json
{
  "success": true,
  "documentId": "uuid",
  "message": "Document uploaded successfully"
}
```

#### GET `/api/documents`
Get user's documents.

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Contract Analysis",
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Analysis Results

#### GET `/api/analysis/{documentId}`
Get analysis results for a document.

**Response:**
```json
{
  "id": "uuid",
  "document_id": "uuid",
  "summary": "This contract contains...",
  "risk_score": "75/100",
  "risks_detected": [...],
  "categories": {...},
  "suggested_questions": [...]
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:reset     # Reset database (if configured)
npm run db:migrate   # Run migrations (if configured)
```

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security

### Authentication
- Supabase Auth with email/password
- Row Level Security (RLS) enabled
- JWT tokens for session management
- Secure password hashing

### Data Protection
- All data encrypted in transit (HTTPS)
- Database encryption at rest
- Secure file storage with Vercel Blob
- Automatic data retention policies

### Privacy Features
- GDPR compliance
- User data deletion
- Configurable retention periods
- Privacy policy and terms of service

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

### Backend Development

For AI/ML model improvements and server enhancements, check out our Python backend repository:

- **Python ML Backend**: [https://github.com/Amit00008/LegalLens](https://github.com/Amit00008/LegalLens)
- **AI Model Improvements**: Contribute to model fine-tuning and optimization
- **Server Enhancements**: Help improve the Hugging Face server performance
- **API Development**: Enhance the ML API endpoints and response handling

> **💡 Looking to contribute to the AI/ML side?** The Python backend repository contains the machine learning models, Hugging Face server code, and AI processing logic. Perfect for data scientists and ML engineers!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: Contact the developer at amitdey1350@gmail.com

### Contact Information

- **Developer**: Amit Dey
- **Email**: amitdey1350@gmail.com
- **Phone**: +91 6003160229
- **GitHub**: [@Amit00008](https://github.com/Amit00008)
- **Project**: [LegalLens AI](https://github.com/Amit00008/LegalLens)

### Support the Project

If you find LegalLens AI helpful, consider supporting the development:

- **GitHub**: Star the repository
- **Feedback**: Share your experience and suggestions
- **Contributions**: Submit pull requests or report issues
- **Financial Support**: Contact the developer for sponsorship opportunities

## 🚨 Disclaimer

**Important**: This application provides AI-powered analysis for educational and informational purposes only. It is not a substitute for professional legal advice. Always consult with qualified legal professionals for actual legal matters.

The AI analysis results should be used as a starting point for legal review, not as definitive legal guidance. Users are responsible for verifying all information and seeking appropriate legal counsel when needed.

## 📈 Roadmap

### Planned Features
- [ ] Multi-language support
- [ ] Advanced AI models integration
- [ ] Collaborative document review
- [ ] API for third-party integrations
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Custom risk assessment rules
- [ ] Legal precedent integration
- [ ] Document comparison tools
- [ ] Real-time collaboration

### Technical Improvements
- [ ] Redis caching for performance
- [ ] Background job processing
- [ ] Model fine-tuning for legal domains
- [ ] API versioning
- [ ] Advanced error handling
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] CI/CD pipeline optimization

---

**Built with ❤️ using Next.js, TypeScript, Supabase, and AI/ML technologies**

*LegalLens AI - Making legal document analysis accessible to everyone*