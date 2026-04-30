# Frontend Pages Guide

Detailed explanation of each page in the WebVCS frontend application.

---

## 1. **Dashboard (page.tsx)**

**Location**: `frontend/app/page.tsx`

**Purpose**: Main landing page showing project overview, statistics, and recent activity.

### Layout Structure
```
Sidebar + [
  Navbar
  └── Main Content
      ├── Welcome Section
      ├── Stats Cards (3 columns)
      ├── Your Projects Section
      └── Recent Activity Section
]
```

### Sections

#### A. Welcome Section
```
"Welcome back, {firstName} 👋"
"Here's an overview of your projects and recent activity."
```
- Personalized greeting with user's first name
- Shows login user's name from Clerk

#### B. Stats Cards (3 columns)
1. **Total Projects**
   - Icon: Globe (blue)
   - Value: Count of all sites
   - Shows: "Active" badge

2. **Total Versions**
   - Icon: Trending Up (emerald)
   - Value: Sum of all version numbers
   - Shows: "Live" badge

3. **Last Activity**
   - Icon: Clock (amber)
   - Value: Date of most recent activity
   - Shows: "Recent" badge

#### C. Your Projects Section
**Title**: "Your Projects"
**Subtitle**: "Manage and deploy your web projects"
**Button**: "+ New Project"

**Empty State** (0 projects):
```
- Large folder icon
- "No projects yet"
- Description text
- "Create First Project" button
```

**Projects List** (1+ projects):
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Each project card shows:
  - Globe icon with gradient background
  - Project name (clickable link)
  - Current version number (`v1`, `v2`, etc.)
  - Creation date
  - Hover effect: Arrow indicator appears

#### D. Recent Activity Section
**Title**: "Recent Activity" with Activity icon
**Subtitle**: "Latest deployments and rollbacks across your projects"

**Empty State** (0 activity):
```
- Large activity icon
- "No activity yet"
- Description text
```

**Activity List** (1+ activities):
- Shows up to 10 most recent activities globally
- Each activity item contains:
  - Action icon (Upload 🔵 or Rollback 🟡)
  - Action description ("Deployed new version" or "Rolled back version")
  - Project link (clickable)
  - Date and time
  - Optional description
- Hover effects for better interactivity

### Key Features

#### Data Fetching
```javascript
// On mount:
1. Check if user is authenticated
2. GET /api/sites → List all projects
3. GET /api/audit-logs?limit=10 → Get recent activities
4. Set loading to false
```

#### State Management
```javascript
const [sites, setSites] = useState([]);
const [activityLogs, setActivityLogs] = useState([]);
const [loading, setLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
```

#### Interactions
1. **Create Project** → Click "+ New Project" → Opens `CreateSiteModal`
2. **View Project** → Click on project card → Navigate to `/sites/:siteId`
3. **View Activity** → Click on activity project link → Navigate to `/sites/:siteId`

#### Calculations
```javascript
// Total versions across all sites
const totalVersions = sites.reduce(
  (acc, site) => acc + (site.currentVersionId?.versionNumber || 0),
  0
);
```

### API Endpoints Used
```javascript
GET /api/sites
GET /api/audit-logs?limit=10
```

### Styling
- **Layout**: Sidebar (260px) + Main content
- **Background**: Light slate (50% opacity)
- **Cards**: White with subtle borders
- **Animations**: Staggered fade-in effects
- **Spacing**: 8px base unit, 24px sections

### Empty States Handled
1. **Loading** - Spinner animation
2. **Not signed in** - Landing page with CTA buttons
3. **No projects** - Empty state with create button
4. **No activity** - Empty state message

### Responsive Design
- **Mobile**: Single column, hidden search, compact sidebar
- **Tablet**: 2 project columns, visible search
- **Desktop**: 3 project columns, full layout

---

## 2. **Site Detail (sites/[siteId]/page.tsx)**

**Location**: `frontend/app/sites/[siteId]/page.tsx`

**Purpose**: Detailed view of a single project with upload, version history, diff viewer, and audit logs.

### Layout Structure
```
Sidebar + [
  Navbar
  └── Main Content
      ├── Back Navigation
      ├── Site Header (name, current version)
      ├── Upload Dropzone
      ├── Version History Tabs
      │   ├── Tab 1: Versions List
      │   │   └── DiffViewer (for comparison)
      │   └── Tab 2: Audit Trail
      │       └── AuditLogViewer
      └── Modals (if any)
]
```

### Sections

#### A. Header Section
```
← [Back to Dashboard] | Site Name | Current Version: v5
```
- Back button navigates to dashboard
- Site name display
- Current version badge

#### B. Upload Dropzone Section
- `<UploadDropzone />` component
- Accepts ZIP files
- Shows progress during upload
- Displays success message with stats

#### C. Version History Section
**Tabs or Sections**:

1. **Versions Tab**
   - Lists all versions in order (newest first)
   - Each version card shows:
     - Version number
     - File count
     - Upload date
     - "Set as Live" button (if not current)
     - "Rollback" button (if not current)
     - "Compare" checkbox (to select for diff)
   - Diff viewer shows when 2 versions selected

2. **Audit Tab**
   - `<AuditLogViewer />` component
   - Timeline of all upload/rollback events
   - Expandable list

#### D. Diff Viewer Section
**Appears when 2 versions are selected**:
- `<DiffViewer />` component
- Shows comparison between selected versions
- Change summary badges
- File-by-file diff table

### Key Features

#### Data Fetching
```javascript
// On mount and when siteId changes:
1. Check if user is authenticated
2. GET /api/sites → Find specific site by ID
3. GET /api/sites/:siteId/versions → List all versions
4. Set loading to false
```

#### State Management
```javascript
const [site, setSite] = useState(null);
const [versions, setVersions] = useState([]);
const [loading, setLoading] = useState(true);
const [rollbackLoading, setRollbackLoading] = useState(null);

// For diff viewer
const [diffBaseId, setDiffBaseId] = useState(null);
const [diffTargetId, setDiffTargetId] = useState(null);
```

#### Interactions

1. **Upload New Version**
   - User drags ZIP into dropzone
   - Upload completes
   - `onUploadSuccess()` triggered
   - `fetchSiteAndVersions()` runs
   - Version list updates with new version

2. **Compare Versions**
   - User clicks checkboxes on two versions
   - Sets `diffBaseId` and `diffTargetId`
   - `<DiffViewer />` renders with comparison
   - User can see what changed between versions

3. **Rollback**
   - User clicks "Rollback" button on version
   - Confirmation dialog appears
   - If confirmed:
     - `POST /api/sites/:siteId/versions/:versionId/rollback`
     - Site pointer updates to that version
     - Version list refreshes
     - Current version badge updates
   - If cancelled: Nothing happens

4. **Refresh Data**
   - Manually refresh versions
   - Auto-refresh after upload
   - Auto-refresh after rollback

#### Version Operations

**Set as Live**:
```javascript
// Button only shown if version is not current
POST /api/sites/:siteId/versions/:versionId/rollback
```

**Rollback**:
```javascript
// Confirmation required
POST /api/sites/:siteId/versions/:versionId/rollback

// After success:
1. Refresh site data
2. Refresh versions list
3. Update current version display
4. Show success message
```

**Compare**:
```javascript
// Select two versions via checkboxes
setDiffBaseId(version1._id);
setDiffTargetId(version2._id);

// DiffViewer component renders:
GET /api/versions/compare/:baseVersionId/:targetVersionId
```

### API Endpoints Used
```javascript
GET /api/sites                              // Get all sites
GET /api/sites/:siteId/versions             // Get version history
POST /api/sites/:siteId/versions/:versionId/rollback  // Rollback
GET /api/versions/compare/:baseVersionId/:targetVersionId  // Compare
GET /api/sites/:siteId/audit-logs           // Get audit trail
```

### Error Handling
```javascript
// Rollback errors
if (!res.ok) {
  alert("Rollback failed");
  console.error(err);
}

// Data fetch errors
console.error("Error fetching versions:", err);
```

### Styling
- **Layout**: Same sidebar + navbar as dashboard
- **Version Cards**: Grid or list layout
- **Action Buttons**: Confirm dialogs for destructive actions
- **Loading States**: Spinners for async operations

### Responsive Design
- **Mobile**: Stacked layout, scrollable diff table
- **Desktop**: Side-by-side versions and diff

### Security
- Confirmation dialog before rollback (prevents accidents)
- User can only see their own sites (enforced by backend)
- All API calls require valid auth token

---

## Page Navigation Flow

```
Landing Page (unauthenticated)
├── Sign In → Dashboard
└── Sign Up → Dashboard

Dashboard (authenticated)
├── Click Project → Site Detail
├── Click "+ New Project" → CreateSiteModal → Dashboard
└── Click Activity Link → Site Detail

Site Detail
├── Back Button → Dashboard
├── Upload ZIP → Refresh versions
├── Rollback → Confirm → Refresh
└── Compare Versions → Show DiffViewer
```

---

## Data Flow Diagram

```
User Action
    ↓
React Component State Update
    ↓
API Call (with Auth Token)
    ↓
Backend Processing
    ↓
Database/Storage Update
    ↓
Response to Frontend
    ↓
State Update + UI Render
    ↓
User Sees Result
```

---

## Common Patterns Used in Pages

### 1. Authentication Guard Pattern
```typescript
if (!isLoaded || !isSignedIn) {
  return <LoadingOrRedirect />;
}
```

### 2. Data Loading Pattern
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    try {
      // Fetch data
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, [dependencies]);

if (loading) return <LoadingSpinner />;
```

### 3. Error Handling Pattern
```typescript
const [error, setError] = useState("");

try {
  // Operation
} catch (err) {
  setError(err.message);
} finally {
  // Cleanup
}

if (error) return <ErrorDisplay error={error} />;
```

### 4. Async Action Pattern
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await apiCall();
    await refetchData();
  } catch (err) {
    showError(err);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Performance Considerations

1. **Lazy Loading** - Components only render when accessed
2. **Memoization** - Consider using `useMemo` for expensive calculations
3. **Caching** - Activity logs cached at global level
4. **Pagination** - Activity logs limited to 10 items
5. **Optimistic Updates** - Could be added for faster UX

---

## Next Steps
- See [COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md) for component details
- See [API_INTEGRATION.md](API_INTEGRATION.md) for backend communication
