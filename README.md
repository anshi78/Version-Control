# Website Version Control System

This repository contains the full code for the cloud-based Website Version Control System using Next.js, Node.js, Express, MongoDB, Amazon S3, and Clerk.

## Project Structure

- `/backend`: Express.js API handling ZIP extraction, SHA-256 deduplication hashing, MongoDB storage metadata, S3 deployment, and rollback logic.
- `/frontend`: Next.js App Router providing the Dashboard, drag-and-drop ZIP uploads, version history, visual diff comparison, and one-click rollback.

## Getting Started

Because this project relies heavily on external cloud infrastructure, you must provision resources for:
1. **Clerk Authentication** (Create an application at clerk.com)
2. **MongoDB** (Create a cluster at mongodb.com)
3. **Amazon S3** (Create a bucket in AWS Console and procure IAM keys)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your real credentials
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your real Clerk Publishable and Secret Keys
npm run dev
```

### 3. Usage
Navigate to `http://localhost:3000` to view the UI.
Once logged in, click "New Project", then upload a ZIP file containing your website's HTML/CSS/JS (without a parent folder, just the raw files at the root of the ZIP).

The backend will automatically:
1. Lock the site to prevent race conditions.
2. Unzip and hash each file (SHA-256).
3. If the hash hasn't been uploaded before, store the blob in S3 (`/blobs/[hash]`).
4. Generate a manifest referencing `filepath -> hash`.
5. Point the "current site version" to the new manifest.
6. Record an audit log.

You can then compare versions using the built-in diff viewer and rollback instantly.
