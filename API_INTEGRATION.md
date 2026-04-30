# Frontend API Integration Guide

How the frontend communicates with the backend API.

---

## Configuration

### API Base URL
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
```

**Environment Variable**: `NEXT_PUBLIC_API_URL`
- **Development**: `http://localhost:5000`
- **Production**: Backend deployed URL (e.g., Render)

### Authentication
All API requests include Clerk JWT token:
```javascript
const token = await getToken();
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"
};
```

---

## API Endpoints Reference

### 1. Sites Management

#### Get All Sites
```javascript
GET /api/sites

// Frontend code:
const res = await fetch(`${API_URL}/api/sites`, {
  headers: { Authorization: `Bearer ${token}` }
});
const sites = await res.json();

// Response:
[
  {
    _id: "site-123",
    name: "My Website",
    owner_id: "user-456",
    currentVersionId: { versionNumber: 5, _id: "version-789" },
    created_at: "2026-04-30T10:00:00Z"
  }
]
```

**Used in**: Dashboard, Site Detail page

---

#### Create Site
```javascript
POST /api/sites

// Frontend code:
const res = await fetch(`${API_URL}/api/sites`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ name: "New Project" })
});
const newSite = await res.json();

// Request body:
{
  name: "string (required, min 1 char)"
}

// Response:
{
  _id: "site-123",
  name: "New Project",
  owner_id: "user-456",
  currentVersionId: null,
  created_at: "2026-04-30T10:00:00Z"
}
```

**Used in**: CreateSiteModal component

---

### 2. Upload & Versioning

#### Upload ZIP File
```javascript
POST /api/sites/:siteId/upload

// Frontend code:
const formData = new FormData();
formData.append("website", zipFile);

const res = await fetch(`${API_URL}/api/sites/${siteId}/upload`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData
});
const result = await res.json();

// Request:
- MultiPart form data
- File field: "website" (ZIP file)

// Response:
{
  version: 1,
  totalFiles: 25,
  newBlobs: 8,
  duplicateBlobs: 17,
  message: "Version created successfully"
}
```

**Used in**: UploadDropzone component

**Notes**:
- Only accepts `.zip` files
- Returns version number
- Shows deduplication stats

---

#### Get Versions for Site
```javascript
GET /api/sites/:siteId/versions

// Frontend code:
const res = await fetch(`${API_URL}/api/sites/${siteId}/versions`, {
  headers: { Authorization: `Bearer ${token}` }
});
const versions = await res.json();

// Response:
[
  {
    _id: "version-1",
    versionNumber: 5,
    siteId: "site-123",
    fileManifest: { ... },
    created_at: "2026-04-30T11:00:00Z"
  },
  {
    _id: "version-2",
    versionNumber: 4,
    siteId: "site-123",
    fileManifest: { ... },
    created_at: "2026-04-30T10:30:00Z"
  }
]
```

**Used in**: Site Detail page

**Notes**:
- Returns versions newest first
- Includes file manifest for each version

---

#### Rollback to Version
```javascript
POST /api/sites/:siteId/versions/:versionId/rollback

// Frontend code:
const res = await fetch(
  `${API_URL}/api/sites/${siteId}/versions/${versionId}/rollback`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  }
);
const result = await res.json();

// Response:
{
  message: "Rollback successful",
  newCurrentVersion: {
    _id: "version-2",
    versionNumber: 4,
    siteId: "site-123"
  }
}
```

**Used in**: Site Detail page

**Notes**:
- Confirmation dialog shown before rollback
- Updates site's current version pointer
- Creates audit log entry for ROLLBACK

---

### 3. Diff & Comparison

#### Compare Two Versions
```javascript
GET /api/versions/compare/:baseVersionId/:targetVersionId

// Frontend code:
const res = await fetch(
  `${API_URL}/api/versions/compare/${baseVersionId}/${targetVersionId}`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
const diff = await res.json();

// Response:
{
  added: ["new-file.html", "new-style.css"],
  removed: ["old-page.html"],
  modified: ["index.html"],
  unchanged: ["logo.png", "about.html"]
}
```

**Used in**: DiffViewer component

**Notes**:
- Compares two versions
- Returns file lists by change type
- Used for visual diff display

---

### 4. Audit Logging

#### Get Audit Logs for Site
```javascript
GET /api/sites/:siteId/audit-logs

// Frontend code:
const res = await fetch(`${API_URL}/api/sites/${siteId}/audit-logs`, {
  headers: { Authorization: `Bearer ${token}` }
});
const logs = await res.json();

// Response:
[
  {
    _id: "log-1",
    action: "UPLOAD",
    userId: "user-456",
    versionId: "version-5",
    description: "Deployed new version",
    siteId: "site-123",
    timestamp: "2026-04-30T11:00:00Z",
    createdAt: "2026-04-30T11:00:00Z"
  },
  {
    _id: "log-2",
    action: "ROLLBACK",
    userId: "user-456",
    versionId: "version-3",
    description: "Reverted to version 3",
    siteId: "site-123",
    timestamp: "2026-04-30T10:30:00Z",
    createdAt: "2026-04-30T10:30:00Z"
  }
]
```

**Used in**: AuditLogViewer component

---

#### Get Global Activity Logs
```javascript
GET /api/audit-logs?limit=10

// Frontend code:
const res = await fetch(`${API_URL}/api/audit-logs?limit=10`, {
  headers: { Authorization: `Bearer ${token}` }
});
const logs = await res.json();

// Query parameters:
- limit: number (default: 10, max: 50)

// Response:
[
  {
    _id: "log-1",
    action: "UPLOAD",
    userId: "user-456",
    versionId: "version-5",
    siteId: "site-123",
    siteName: "My Website",  // Added by backend
    description: "Deployed new version",
    timestamp: "2026-04-30T11:00:00Z",
    createdAt: "2026-04-30T11:00:00Z"
  }
]
```

**Used in**: Dashboard page (Recent Activity section)

**Notes**:
- Returns logs for ALL user's sites
- Sorted by timestamp descending
- Most recent 10 by default
- Includes site name for display

---

## Error Handling

### Response Status Codes

| Status | Meaning | Handling |
|--------|---------|----------|
| 200 | Success | Parse JSON response |
| 400 | Bad Request | Show user-friendly error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show "Access Denied" |
| 404 | Not Found | Show "Not Found" |
| 500 | Server Error | Show "Server Error" |

### Error Response Format
```javascript
{
  error: "Description of what went wrong"
}
```

### Frontend Error Handling Pattern
```javascript
try {
  const res = await fetch(url, options);
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch");
  }
  
  const data = await res.json();
  // Use data
  
} catch (err) {
  console.error(err);
  setError(err.message);
  // Display error to user
}
```

---

## Request/Response Examples

### Example 1: Create Site & Upload Version

```javascript
// Step 1: Create site
const siteRes = await fetch(`${API_URL}/api/sites`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ name: "My Portfolio" })
});
const site = await siteRes.json();
console.log(site._id); // "site-123"

// Step 2: Upload ZIP
const formData = new FormData();
formData.append("website", zipFile);

const uploadRes = await fetch(
  `${API_URL}/api/sites/${site._id}/upload`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  }
);
const upload = await uploadRes.json();
console.log(upload.version); // 1
```

### Example 2: Compare and Rollback

```javascript
// Get versions
const versionsRes = await fetch(
  `${API_URL}/api/sites/${siteId}/versions`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const versions = await versionsRes.json();

// Compare v2 and v5
const diffRes = await fetch(
  `${API_URL}/api/versions/compare/${versions[3]._id}/${versions[0]._id}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const diff = await diffRes.json();
console.log(diff.added);    // New files
console.log(diff.removed);  // Deleted files
console.log(diff.modified); // Changed files

// Rollback to v2
const rollbackRes = await fetch(
  `${API_URL}/api/sites/${siteId}/versions/${versions[3]._id}/rollback`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  }
);
const result = await rollbackRes.json();
console.log("Rolled back to version", result.newCurrentVersion.versionNumber);
```

---

## API Call Locations in Code

### Dashboard (`app/page.tsx`)
```javascript
// Get all sites
GET /api/sites

// Get global activity logs
GET /api/audit-logs?limit=10
```

### Site Detail (`app/sites/[siteId]/page.tsx`)
```javascript
// Get specific site
GET /api/sites

// Get version history
GET /api/sites/:siteId/versions

// Perform rollback
POST /api/sites/:siteId/versions/:versionId/rollback
```

### CreateSiteModal (`components/CreateSiteModal.tsx`)
```javascript
// Create new site
POST /api/sites
```

### UploadDropzone (`components/UploadDropzone.tsx`)
```javascript
// Upload ZIP
POST /api/sites/:siteId/upload
```

### DiffViewer (`components/DiffViewer.tsx`)
```javascript
// Compare versions
GET /api/versions/compare/:baseVersionId/:targetVersionId
```

### AuditLogViewer (`components/AuditLogViewer.tsx`)
```javascript
// Get site audit logs
GET /api/sites/:siteId/audit-logs
```

---

## Authentication Flow

### 1. User Signs In (Clerk)
```
Clerk Modal → User Enters Credentials → JWT Token Generated
```

### 2. Frontend Stores Token
```javascript
const { getToken } = useAuth();
const token = await getToken(); // Retrieves current JWT
```

### 3. Include in API Request
```javascript
headers: {
  Authorization: `Bearer ${token}`
}
```

### 4. Backend Validates Token
```
Backend receives Authorization header
↓
Verifies JWT signature
↓
Extracts userId
↓
Ensures user owns the resource
↓
Proceeds or returns 401
```

---

## Performance Tips

### 1. Caching
- Activity logs cached at global level (10 items)
- Versions refetched when needed
- Site data refetched after uploads

### 2. Batch Requests
- Could combine multiple fetches
- Currently fetches sites + activity separately on dashboard

### 3. Pagination
- Could implement for version lists
- Currently loads all versions

### 4. Error Recovery
- Retry logic could be added
- Currently one attempt per request

---

## Troubleshooting

### Common Issues

#### 401 Unauthorized
- **Cause**: Missing or invalid JWT token
- **Fix**: Ensure user is authenticated, check token expiration

#### 404 Not Found
- **Cause**: Invalid site ID or version ID
- **Fix**: Verify IDs, ensure resource exists

#### 500 Server Error
- **Cause**: Backend processing error
- **Fix**: Check backend logs, ensure environment variables set

#### Network Error
- **Cause**: Backend not accessible
- **Fix**: Verify API_URL, ensure backend is running

### Debug API Calls
```javascript
// Add logging
console.log("Fetching:", url);
console.log("Headers:", headers);

// Use browser DevTools
// Network tab shows all requests
// Inspect request/response details
```

---

## Next Steps
- See [COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md) for component details
- See [PAGES_GUIDE.md](PAGES_GUIDE.md) for page details
- See [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) for overview
