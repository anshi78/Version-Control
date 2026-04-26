# Website Version Control System

A cloud-based version control system for static websites, built with **Next.js**, **Node.js/Express**, **Supabase (PostgreSQL + Storage)**, and **Clerk Authentication**.

Upload ZIP archives of your website, automatically deduplicate files using SHA-256 hashing, store blobs in Supabase Storage, compare versions visually, and rollback instantly — all from a modern, professional dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Authentication** | Clerk (JWT-based) |
| **Database** | Supabase (PostgreSQL) — stores metadata, versions, audit logs, locks |
| **Blob Storage** | Supabase Storage — content-addressable storage for file blobs |
| **File Processing** | AdmZip for extraction, SHA-256 for deduplication |

---

## Project Structure

```
Version-Control/
├── backend/
│   ├── config/
│   │   └── supabase.js        # Supabase client configuration
│   ├── controllers/
│   │   ├── auditController.js # Audit log retrieval
│   │   ├── siteController.js  # Site CRUD operations
│   │   ├── uploadController.js# ZIP upload, Supabase Storage, versioning
│   │   └── versionController.js# Version history, rollback, diff
│   ├── db/
│   │   └── schema.sql         # PostgreSQL schema (4 tables)
│   ├── middleware/
│   │   └── auth.js            # Clerk JWT authentication middleware
│   ├── routes/
│   │   └── apiRoutes.js       # All API route definitions
│   └── server.js              # Express entry point
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with ClerkProvider
│   │   ├── page.tsx           # Dashboard (project listing)
│   │   └── sites/[siteId]/
│   │       └── page.tsx       # Site detail (upload, versions, diff, audit)
│   └── components/
│       ├── AuditLogViewer.tsx  # Audit trail viewer
│       ├── CreateSiteModal.tsx # New project creation modal
│       ├── DiffViewer.tsx     # Version comparison viewer
│       ├── Navbar.tsx         # Navigation bar with auth
│       └── UploadDropzone.tsx # Drag-and-drop ZIP upload
└── README.md
```

---

## Features

### Core Functionality
- **Site Management** — Create and manage multiple website projects
- **ZIP Upload** — Drag-and-drop ZIP file upload with progress feedback
- **SHA-256 Deduplication** — Files are hashed and only new/changed blobs are stored
- **Version History** — Full timeline of all deployments with metadata
- **Visual Diff** — Compare any two versions to see added, removed, and modified files
- **Instant Rollback** — One-click rollback to any previous version with confirmation
- **Locking Mechanism** — Prevents concurrent uploads to the same site (auto-expires after 5 minutes)
- **Audit Logging** — Every upload and rollback is recorded with user ID, timestamp, and description
- **Audit Log Viewer** — Browse the complete audit trail from the site detail page

### Authentication
- **Clerk Integration** — Full JWT-based authentication on both frontend and backend
- **Protected Routes** — All API endpoints require valid authentication
- **User Isolation** — Users can only see and manage their own projects

---

## Database Schema

The system uses 4 PostgreSQL tables in Supabase:

| Table | Purpose |
|-------|---------|
| `sites` | Project registry with name, owner, and current version pointer |
| `versions` | Version metadata including version number and file manifest (JSONB) |
| `audit_logs` | Action log for UPLOAD and ROLLBACK events |
| `locks` | Row-level upload locking with auto-expiry |

See [`backend/db/schema.sql`](backend/db/schema.sql) for the full schema.

---

## API Endpoints

All endpoints are protected by Clerk authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sites` | Create a new site |
| `GET` | `/api/sites` | List all sites for the authenticated user |
| `POST` | `/api/sites/:siteId/upload` | Upload a ZIP file as a new version |
| `GET` | `/api/sites/:siteId/versions` | List all versions for a site |
| `POST` | `/api/sites/:siteId/versions/:versionId/rollback` | Rollback to a specific version |
| `GET` | `/api/versions/compare/:baseId/:targetId` | Compare two versions (diff) |
| `GET` | `/api/sites/:siteId/audit-logs` | Fetch audit logs for a site |

---

## Getting Started

### Prerequisites

You must provision resources for:
1. **Clerk Authentication** — Create an application at [clerk.com](https://clerk.com)
2. **Supabase** — Create a project at [supabase.com](https://supabase.com), run `backend/db/schema.sql` in the SQL editor, and create a Storage bucket named `versions`

### 1. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file with:

```env
PORT=5000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

Start the server:

```bash
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file with:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

### 3. Usage

Navigate to `http://localhost:3000` to view the UI.

Once logged in:
1. Click **"New Project"** to create a website project
2. **Upload a ZIP** file containing your website's HTML/CSS/JS files
3. The backend will automatically:
   - Lock the site to prevent race conditions
   - Unzip and hash each file (SHA-256)
   - Upload new/changed blobs to Supabase Storage (`blobs/{hash}`)
   - Generate a manifest mapping `filepath → hash`
   - Point the site's "current version" to the new version
   - Record an audit log entry
4. **Compare versions** using the built-in diff viewer
5. **Rollback** instantly to any previous version
6. **View the audit trail** to see the full history of actions

---

## How It Works

```
User uploads ZIP
       │
       ▼
┌─────────────────┐
│  Acquire Lock   │──── 409 if already locked
│  (Supabase DB)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract ZIP    │
│  (AdmZip)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hash Files     │
│  (SHA-256)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐     ┌──────────────┐
│  Check Supabase     │────▶│  Skip if     │
│  Storage for blob   │     │  exists      │
└────────┬────────────┘     └──────────────┘
         │ (new)
         ▼
┌─────────────────────┐
│  Upload to Supabase │
│  Storage bucket     │
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│  Save Version   │
│  + Manifest     │
│  (Supabase DB)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Site    │
│  Pointer        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Write Audit    │
│  Log Entry      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Release Lock   │
└─────────────────┘
```
