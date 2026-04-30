# Frontend Components Guide

Detailed explanation of each React component in the WebVCS frontend.

---

## 1. **Navbar.tsx** - Top Navigation Bar

**Location**: `frontend/components/Navbar.tsx`

**Purpose**: Header component displayed on all pages with search, notifications, and user menu.

### Features
- **Search Bar** - Search projects (placeholder, not fully implemented)
- **Notifications** - Bell icon with activity indicator
- **User Menu** - Display user profile or sign-in button
- **Responsive** - Hides search on mobile devices

### Key Props
None - Uses Clerk hooks internally

### Code Flow
```
1. Check if user is authenticated (isSignedIn)
2. If loading - show skeleton loader
3. If authenticated - display user name, email, and avatar via Clerk UserButton
4. If not authenticated - show Sign In button
```

### Styling
- Sticky top position (z-index 30)
- Glassmorphic background (semi-transparent with blur)
- Responsive grid layout

### Dependencies
- `@clerk/nextjs` - Authentication UI

---

## 2. **Sidebar.tsx** - Left Navigation Menu

**Location**: `frontend/components/Sidebar.tsx`

**Purpose**: Fixed left sidebar for navigation between Dashboard, My Sites, and Activity sections.

### Features
- **Logo** - WebVCS branding with gradient icon
- **Navigation Links** - Dashboard, My Sites, Activity
- **Active State** - Highlights current page
- **Plan Display** - Shows free plan usage (3 of 5 projects)
- **Help & Settings** - Bottom menu items (placeholders)

### Key Props
None - Uses Next.js hooks internally

### Code Flow
```
1. Get current pathname
2. Check each nav link against current path
3. Highlight active link with indigo background
4. Display plan progress at bottom
```

### Navigation Items
- Dashboard → `/` 
- My Sites → `/#sites` (scrolls to section)
- Activity → `/#activity` (scrolls to section)

### Styling
- Fixed position (left side, z-index 40)
- White background with subtle border
- Color-coded active states
- Icons from lucide-react

---

## 3. **CreateSiteModal.tsx** - New Project Modal

**Location**: `frontend/components/CreateSiteModal.tsx`

**Purpose**: Modal dialog for creating a new website project.

### Features
- **Form Input** - Project name field with validation
- **Error Handling** - Display error messages
- **Loading State** - Show spinner during submission
- **Backdrop** - Click outside to close
- **Form Validation** - Requires non-empty name

### Props
```typescript
{
  onClose: () => void;        // Called when modal closes
  onSuccess: () => void;      // Called after successful creation
}
```

### Code Flow
```
1. User clicks "New Project" button
2. Modal opens with form
3. User enters project name
4. Submit → POST /api/sites with name
5. On success → call onSuccess() and close
6. Parent component refreshes site list
```

### API Call
```javascript
POST /api/sites
Headers: { Authorization: Bearer ${token} }
Body: { name: "Project Name" }
```

### Styling
- Modal centered with backdrop
- Smooth animations (fade-in, scale-in)
- Gradient icon in header
- Two-button footer (Cancel, Create)

---

## 4. **UploadDropzone.tsx** - ZIP Upload Area

**Location**: `frontend/components/UploadDropzone.tsx`

**Purpose**: Drag-and-drop zone for uploading website ZIP files and creating new versions.

### Features
- **Drag & Drop** - Accept ZIP files by dragging
- **File Picker** - Click to select file from computer
- **Progress Bar** - Visual upload progress (30%, 50%, 100%)
- **Success State** - Show confirmation with version info
- **Error Handling** - Display validation and upload errors
- **Type Validation** - Only accept `.zip` files

### Props
```typescript
{
  siteId: string;           // Project ID to upload to
  onUploadSuccess: () => void; // Called after successful upload
}
```

### Code Flow
```
1. User drags ZIP file over dropzone
2. File validated as .zip type
3. FormData created with file
4. POST to /api/sites/:siteId/upload
5. Progress shown: 30% (start) → 50% (uploading) → 100% (complete)
6. Success message shows version number and file stats
7. Auto-dismisses after 5 seconds
8. Parent component refreshes versions
```

### API Call
```javascript
POST /api/sites/:siteId/upload
Headers: { Authorization: Bearer ${token} }
Body: FormData with "website" file
Response: { version, totalFiles, newBlobs }
```

### Styling
- Animated dashed border
- Color changes on drag (indigo highlight)
- Icon changes based on state (upload cloud, spinner, checkmark)
- Progress bar animation

### Dependencies
- `react-dropzone` - Drag-and-drop functionality

---

## 5. **DiffViewer.tsx** - Version Comparison

**Location**: `frontend/components/DiffViewer.tsx`

**Purpose**: Visual comparison of differences between two versions.

### Features
- **Change Summary** - Count of added, removed, modified files
- **File Table** - List of all changes with status indicators
- **Color Coding** - Green (added), Red (removed), Amber (modified)
- **Scrollable** - Table scrolls for large diffs
- **Loading State** - Shows spinner while fetching

### Props
```typescript
{
  baseVersionId: string;    // Original version to compare from
  targetVersionId: string;  // New version to compare to
}
```

### Code Flow
```
1. Component receives two version IDs
2. Fetch diff data: GET /api/versions/compare/:baseVersionId/:targetVersionId
3. Parse response with added, removed, modified, unchanged files
4. Display summary badges
5. Render file table with change indicators
6. Show "No changes" if versions are identical
```

### API Response Structure
```javascript
{
  added: ["new-file.html"],
  removed: ["old-file.css"],
  modified: ["index.html", "style.css"],
  unchanged: ["logo.png", ...]
}
```

### Status Indicators
- **`+` (Green)** - File added in new version
- **`−` (Red)** - File removed in new version
- **`~` (Amber)** - File modified in new version
- **Icon** - File remains unchanged

### Styling
- Summary badges with color coding
- Sticky table header
- Scrollable table body (max-height: 400px)
- Hover effects on rows

---

## 6. **AuditLogViewer.tsx** - Activity History

**Location**: `frontend/components/AuditLogViewer.tsx`

**Purpose**: Timeline view of all upload and rollback events for a project.

### Features
- **Action Icons** - Upload (blue) vs Rollback (amber)
- **Expandable List** - Show 5 logs, expand to see all
- **User Info** - Display which user performed action
- **Timestamps** - Show when action occurred
- **Event Details** - Description of what happened
- **Empty State** - Message when no events

### Props
```typescript
{
  siteId: string;  // Project ID to fetch logs for
}
```

### Code Flow
```
1. Component mounts
2. Fetch logs: GET /api/sites/:siteId/audit-logs
3. Parse logs array
4. Initially show first 5 logs
5. Expand button toggles showing all logs
6. Each log displays with icon, description, and timestamp
```

### Log Structure
```javascript
{
  _id: "log-id",
  action: "UPLOAD" | "ROLLBACK",
  userId: "user-id",
  versionId: "version-id",
  description: "User friendly description",
  createdAt: "2026-04-30T10:30:00Z"
}
```

### Action Types
- **UPLOAD** - New version deployed
- **ROLLBACK** - Reverted to previous version

### Styling
- Card container with header
- Action icons with color coding
- Scrollable if many logs
- Expand/Collapse button toggles visibility

---

## 7. **Root Layout (layout.tsx)**

**Location**: `frontend/app/layout.tsx`

**Purpose**: Root layout component that wraps all pages with Clerk authentication and global styles.

### Features
- **Clerk Provider** - Enables authentication across app
- **Font Loading** - Loads Inter font from Google Fonts
- **Global Styles** - Applies `globals.css`
- **Metadata** - SEO title and description

### Code Flow
```
1. Wrap entire app with ClerkProvider
2. Load Inter font with weights 300-800
3. Apply font variable to HTML
4. Render children (all pages)
```

### Global Font
- **Font**: Inter (sans-serif)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Subsets**: Latin
- **CSS Variable**: `--font-inter`

### Metadata
- **Title**: "WebVCS — Website Version Control"
- **Description**: "Deploy, version, compare, and rollback your websites with confidence."

---

## Component Usage Patterns

### 1. **Authentication Check Pattern**
```typescript
const { isLoaded, isSignedIn, getToken } = useAuth();

if (!isLoaded || !isSignedIn) {
  return <LoadingOrLoginUI />;
}
```

### 2. **API Call Pattern**
```typescript
const token = await getToken();
const res = await fetch(`${API_URL}/api/endpoint`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
```

### 3. **Loading State Pattern**
```typescript
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) return <Loader />;
```

### 4. **Modal Pattern**
```typescript
{isOpen && <Modal onClose={() => setIsOpen(false)} />}
```

---

## Component Dependencies Graph

```
layout.tsx (Root)
├── Navbar.tsx (All pages)
├── Sidebar.tsx (All pages)
├── page.tsx (Dashboard)
│   ├── CreateSiteModal.tsx
│   └── (No other components)
└── sites/[siteId]/page.tsx (Site Detail)
    ├── UploadDropzone.tsx
    ├── DiffViewer.tsx
    └── AuditLogViewer.tsx
```

---

## Styling & CSS Classes

### Custom Utility Classes
```css
.btn-primary        /* Primary action button */
.btn-secondary      /* Secondary action button */
.card              /* Card container */
.stat-card         /* Statistics display */
.badge-*           /* Various badge styles */
.input-field       /* Form input styling */
```

### Tailwind Breakpoints Used
- `hidden md:block` - Hide on mobile, show on desktop
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grid
- `sm:block` - Show on small screens and up

---

## Next Steps
- See [PAGES_GUIDE.md](PAGES_GUIDE.md) for page component details
- See [API_INTEGRATION.md](API_INTEGRATION.md) for backend communication
