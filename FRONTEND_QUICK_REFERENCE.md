# Frontend Documentation - Quick Reference

A quick reference guide for understanding the WebVCS frontend codebase.

---

## 📁 File Structure at a Glance

```
frontend/
├── app/
│   ├── page.tsx              ← Dashboard (main page)
│   ├── layout.tsx            ← Root wrapper (Clerk + fonts)
│   ├── globals.css           ← Global styles
│   └── sites/[siteId]/
│       └── page.tsx          ← Site details page
│
├── components/
│   ├── Navbar.tsx            ← Header with search, notifications, user menu
│   ├── Sidebar.tsx           ← Left navigation
│   ├── CreateSiteModal.tsx   ← Modal to create new project
│   ├── UploadDropzone.tsx    ← Drag & drop ZIP upload
│   ├── DiffViewer.tsx        ← Shows changes between versions
│   └── AuditLogViewer.tsx    ← Timeline of activities
│
├── package.json              ← Dependencies
├── tailwind.config.js        ← Tailwind CSS config
├── tsconfig.json             ← TypeScript config
└── .env                      ← Environment variables
```

---

## 🔍 What Each File Does

| File | Purpose | Key Features |
|------|---------|--------------|
| `page.tsx` | Dashboard | Shows projects & recent activity |
| `sites/[siteId]/page.tsx` | Project detail | Upload, versions, compare, rollback |
| `Navbar.tsx` | Header | Search, notifications, user profile |
| `Sidebar.tsx` | Navigation | Main menu with active state |
| `CreateSiteModal.tsx` | Form modal | Create new project |
| `UploadDropzone.tsx` | Upload widget | Drag-drop ZIP with progress |
| `DiffViewer.tsx` | Diff viewer | Shows added/removed/modified files |
| `AuditLogViewer.tsx` | Activity log | Timeline of uploads & rollbacks |
| `layout.tsx` | Root layout | Clerk auth + fonts |

---

## 🎨 Component Hierarchy

```
RootLayout (layout.tsx)
│
├── Clerk Provider
└── Every Page
    │
    ├── Sidebar
    ├── Navbar
    └── Page Content
        │
        ├── Dashboard
        │   ├── Welcome Section
        │   ├── Stats Cards
        │   ├── Projects Grid
        │   │   └── CreateSiteModal (when needed)
        │   └── Activity List
        │
        └── Site Detail
            ├── Upload Area
            │   └── UploadDropzone
            ├── Versions Tab
            │   └── DiffViewer (when comparing)
            └── Audit Tab
                └── AuditLogViewer
```

---

## 🔄 Data Flow

### 1. Page Loads
```
User visits → Next.js loads page → Check auth (Clerk)
→ Fetch data from backend → Render components
```

### 2. User Uploads ZIP
```
Drag file to dropzone → FormData created → POST /api/sites/:id/upload
→ Backend processes → Response with version info → UI updates
```

### 3. User Compares Versions
```
Select 2 versions → GET /api/versions/compare/:id1/:id2
→ DiffViewer renders → Shows added/removed/modified files
```

### 4. User Rollbacks
```
Click Rollback → Confirmation dialog → POST /api/sites/:id/versions/:vid/rollback
→ Backend updates pointer → Refresh page → UI shows new current version
```

---

## 📡 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sites` | GET | List all projects |
| `/api/sites` | POST | Create new project |
| `/api/sites/:id/upload` | POST | Upload ZIP file |
| `/api/sites/:id/versions` | GET | Get version history |
| `/api/versions/compare/:id1/:id2` | GET | Compare two versions |
| `/api/sites/:id/versions/:vid/rollback` | POST | Rollback to version |
| `/api/sites/:id/audit-logs` | GET | Get site audit logs |
| `/api/audit-logs` | GET | Get global activity logs |

---

## 🛠️ Key Hooks Used

### From Clerk (Authentication)
```javascript
const { getToken, isLoaded, isSignedIn } = useAuth();
const { user, firstName, primaryEmailAddress } = useUser();
```

### From React
```javascript
const [state, setState] = useState(initialValue);
useEffect(() => { /* side effects */ }, [dependencies]);
```

### From Next.js
```javascript
const params = useParams();      // Get dynamic params (like :siteId)
const pathname = usePathname();  // Get current page path
const router = useRouter();      // Navigate programmatically
```

### From react-dropzone
```javascript
const { getRootProps, getInputProps, isDragActive } = useDropzone({...});
```

---

## 🎯 Common Patterns

### Authentication Check
```typescript
const { isLoaded, isSignedIn } = useAuth();
if (!isLoaded) return <Loading />;
if (!isSignedIn) return <SignIn />;
// Render page
```

### API Call with Token
```typescript
const { getToken } = useAuth();
const token = await getToken();
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Loading & Error States
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

try {
  // Fetch/process
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}

if (loading) return <Spinner />;
if (error) return <Error msg={error} />;
```

### Modal Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open</button>
    {isOpen && <Modal onClose={() => setIsOpen(false)} />}
  </>
);
```

---

## 🚀 Running the Frontend

### Development
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com and import repo
# Set Root Directory: frontend
# Add environment variables
# Deploy
```

---

## 🔑 Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Clerk Pages
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

## 🎨 Styling

### Tailwind Classes Used
- `btn-primary` - Primary button (indigo background)
- `btn-secondary` - Secondary button (gray background)
- `card` - Card container (white with border)
- `stat-card` - Statistics card
- `badge-primary` - Badge (indigo)
- `badge-success` - Badge (green)
- `badge-warning` - Badge (amber)
- `input-field` - Form input

### Responsive Design
- `hidden md:block` - Hide on mobile
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grid
- `flex-col md:flex-row` - Stack on mobile, row on desktop

---

## 🐛 Debugging Tips

### Check API Calls
```javascript
// Open DevTools → Network tab
// See all requests/responses
// Check headers and body
```

### Check Component State
```javascript
// Open DevTools → React tab
// Click component to see state
// Watch state changes in real-time
```

### Check Authentication
```javascript
// In browser console:
// Clerk user info
const user = await clerkClient.users.getUser();

// Auth token
const token = await clerkClient.session.getToken();
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing token | Check Clerk setup |
| 404 Not Found | Invalid ID | Verify IDs from API |
| CORS Error | Backend not accessible | Check API_URL |
| Component not rendering | Auth not loaded | Add loading check |

---

## 📚 Documentation Files

1. **FRONTEND_ARCHITECTURE.md** - Full architecture overview
2. **COMPONENTS_GUIDE.md** - Detailed component explanations
3. **PAGES_GUIDE.md** - Page component details
4. **API_INTEGRATION.md** - API endpoints and integration

---

## 🔗 Related Backend Documentation

See backend folder for:
- `README.md` - Project overview
- Backend folder structure and files
- API endpoint details
- Database schema

---

## 💡 Key Concepts

### Versioning
- Each upload = new version
- Versions are immutable (read-only)
- Current version is a pointer (can change via rollback)

### Deduplication
- SHA-256 hash of each file
- Identical files across versions share storage
- Saves space and bandwidth

### Audit Trail
- Every upload logged
- Every rollback logged
- User ID and timestamp recorded

### Authentication
- Clerk handles user management
- JWT tokens for API calls
- All endpoints require auth

---

## 🎓 Learning Path

1. Start with **FRONTEND_ARCHITECTURE.md** for big picture
2. Read **COMPONENTS_GUIDE.md** for component details
3. Check **PAGES_GUIDE.md** for page logic
4. Study **API_INTEGRATION.md** for data flow
5. Explore code: Start with `page.tsx` → components

---

## 🤝 Contributing Guidelines

When adding features:
1. Follow existing patterns
2. Add TypeScript types
3. Handle loading/error states
4. Test on mobile and desktop
5. Update docs

When fixing bugs:
1. Check error in DevTools
2. Isolate the issue
3. Add logging to debug
4. Verify fix works
5. Test related features

---

## 📞 Quick Reference Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Format code
npm run format

# Check TypeScript
npm run type-check
```

---

## 🔍 File Search Tips

Find specific functionality:
- **Upload**: `UploadDropzone.tsx`
- **Versions**: `sites/[siteId]/page.tsx`
- **Comparison**: `DiffViewer.tsx`
- **Activity**: `AuditLogViewer.tsx`, `page.tsx`
- **Authentication**: `layout.tsx`, `Navbar.tsx`
- **API calls**: Search for `fetch(` in any component

---

## ✨ Next Steps

- Deploy frontend to Vercel
- Test with real backend
- Monitor performance
- Gather user feedback
- Plan new features

