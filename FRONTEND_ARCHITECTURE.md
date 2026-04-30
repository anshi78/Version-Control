# Frontend Architecture Guide

## Overview
The frontend is a modern Next.js application built with React 18, TypeScript, and Tailwind CSS. It provides a user-friendly interface for managing website versions, comparing changes, and rolling back deployments.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + custom components
- **Icons**: Lucide React
- **Authentication**: Clerk
- **File Upload**: react-dropzone
- **HTTP Client**: Fetch API

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with Clerk Provider
│   ├── page.tsx                 # Dashboard (main page)
│   ├── globals.css              # Global styles
│   ├── sites/
│   │   └── [siteId]/
│   │       └── page.tsx         # Site detail page
│   └── fonts/                   # Custom fonts
├── components/                  # Reusable React components
│   ├── Navbar.tsx              # Top navigation bar
│   ├── Sidebar.tsx             # Left sidebar navigation
│   ├── CreateSiteModal.tsx     # Modal for creating new projects
│   ├── UploadDropzone.tsx      # Drag-and-drop upload zone
│   ├── DiffViewer.tsx          # Version comparison viewer
│   └── AuditLogViewer.tsx      # Activity history viewer
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── .env                        # Environment variables
```

## Key Features

### 1. **Authentication (Clerk)**
- JWT-based authentication
- Protected routes and API endpoints
- User profile management
- Sign in/Sign up modals

### 2. **Project Management**
- Create new website projects
- View all projects in dashboard
- Navigate to individual project details
- Site metadata and version tracking

### 3. **File Upload & Versioning**
- Drag-and-drop ZIP file upload
- Progress tracking during upload
- Automatic version numbering
- Deduplication with SHA-256 hashing

### 4. **Version Comparison**
- Visual diff between any two versions
- Shows added, removed, and modified files
- Color-coded status indicators
- File list with change counts

### 5. **Rollback Functionality**
- One-click rollback to any previous version
- Confirmation dialogs to prevent accidents
- Real-time update of current version

### 6. **Activity Tracking**
- Global activity logs across all projects
- Per-project audit trail
- Upload and rollback events
- Timestamps and user information

## Component Architecture

### Page Components
- **`page.tsx`** - Dashboard: Lists projects and recent activity
- **`sites/[siteId]/page.tsx`** - Site Details: Upload, versions, diff, audit logs

### Layout Components
- **`Navbar.tsx`** - Header with search, notifications, and user menu
- **`Sidebar.tsx`** - Navigation sidebar with main menu items

### Feature Components
- **`CreateSiteModal.tsx`** - Modal form to create new projects
- **`UploadDropzone.tsx`** - Drag-and-drop zone for ZIP uploads
- **`DiffViewer.tsx`** - Visual comparison of two versions
- **`AuditLogViewer.tsx`** - Timeline of all project activities

## State Management

The application uses React's built-in hooks for state management:
- **`useState`** - Local component state
- **`useEffect`** - Side effects and data fetching
- **`useAuth()`** (from Clerk) - Authentication state
- **`useUser()`** (from Clerk) - Current user information
- **`useParams()`** (from Next.js) - Dynamic route parameters

## API Integration

All API calls go through the backend at:
```
${NEXT_PUBLIC_API_URL}/api/...
```

### Main Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/sites` | List all projects |
| `POST` | `/api/sites` | Create new project |
| `GET` | `/api/sites/:siteId/versions` | Get version history |
| `POST` | `/api/sites/:siteId/upload` | Upload new version |
| `POST` | `/api/sites/:siteId/versions/:versionId/rollback` | Rollback to version |
| `GET` | `/api/versions/compare/:baseVersionId/:targetVersionId` | Compare versions |
| `GET` | `/api/sites/:siteId/audit-logs` | Get site audit logs |
| `GET` | `/api/audit-logs` | Get global activity logs |

## Styling System

Uses Tailwind CSS with custom utility classes defined in `globals.css`:
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.card` - Card container
- `.stat-card` - Statistics display card
- `.badge-*` - Badge styles (success, warning, primary, etc.)
- `.input-field` - Standard input styling

## Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=     # Clerk public key
CLERK_SECRET_KEY=                       # Clerk secret key
NEXT_PUBLIC_API_URL=                    # Backend API URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in  # Sign in page
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up  # Sign up page
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/   # Redirect after signin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/   # Redirect after signup
```

## Performance Optimizations

1. **Code Splitting** - Next.js automatically splits code by page/route
2. **Image Optimization** - Next.js Image component (when used)
3. **Font Optimization** - Self-hosted Inter font from Next.js
4. **Caching** - Activity logs cached and fetched globally
5. **Lazy Loading** - Components load only when needed

## Security Features

1. **Authentication** - Clerk JWT tokens on all API calls
2. **Protected Routes** - Pages check `isSignedIn` before rendering
3. **Input Validation** - ZIP file type validation on upload
4. **Error Handling** - Graceful error messages for failed operations
5. **CORS** - Handled by backend

## Development & Deployment

### Local Development
```bash
npm install
npm run dev
# Opens on http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository on Vercel
3. Set environment variables
4. Deploy automatically on push

## Next Steps
- See [COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md) for detailed component explanations
- See [PAGES_GUIDE.md](PAGES_GUIDE.md) for page-specific details
- See [API_INTEGRATION.md](API_INTEGRATION.md) for API communication patterns
