# Migration Guide: HTML → React + Tailwind

## Overview

This guide explains how to migrate from the vanilla HTML/JS/CSS version to the new React + Tailwind stack.

## What Changed

### Before (Vanilla Stack)
- Multiple HTML files (index.html, researcher.html, analyst.html, admin.html, messages.html)
- Inline CSS styles + external CSS file (style.css)
- Vanilla JavaScript with script tags
- Supabase via CDN
- No build process

### After (React Stack)
- Single-page application (SPA) with React Router
- Tailwind CSS for all styling
- Component-based architecture
- Supabase via npm package
- Vite build tool with HMR
- Modern ES6+ JavaScript with JSX

## Key Improvements

### 1. Component Reusability
**Before:**
```html
<!-- Repeated in every HTML file -->
<div class="sidebar">...sidebar code...</div>
<div class="topbar">...topbar code...</div>
```

**After:**
```jsx
// Single Sidebar component used everywhere
import Sidebar from './components/Sidebar'

function AppLayout({ children }) {
  return (
    <>
      <Sidebar />
      <main>{children}</main>
    </>
  )
}
```

### 2. Tailwind CSS Instead of Custom CSS
**Before:**
```css
/* 2000+ lines of custom CSS */
.sidebar {
  width: var(--sidebar-width);
  background: var(--green);
  /* ... */
}
```

**After:**
```jsx
// Utility classes
<aside className="w-64 bg-green-brand flex flex-col">...</aside>
```

### 3. State Management
**Before:**
```javascript
// Global variables
var ROLES = { ADMIN: "admin", /* ... */ };
var STATUS_LABELS = { /* ... */ };

// DOM manipulation
document.getElementById('msg-alert').innerHTML = html;
```

**After:**
```jsx
// React hooks
const [message, setMessage] = useState(null)
const { profile, isApproved } = useAuth()

// Conditional rendering
{message && <Alert type={message.type}>{message.text}</Alert>}
```

### 4. Authentication Flow
**Before:**
- Multiple redirects between HTML files
- Session check on every page load
- Role-based redirects via `redirectToRole()`

**After:**
- React Router handles navigation
- ProtectedRoute component guards routes
- AuthContext provides user state globally

## File Mapping

| Old File | New Location | Notes |
|----------|-------------|-------|
| `index.html` | `src/pages/Login.jsx` | Now a React component |
| `researcher.html` | `src/pages/ResearcherDashboard.jsx` | React component with hooks |
| `analyst.html` | `src/pages/AnalystDashboard.jsx` | React component with hooks |
| `admin.html` | `src/pages/AdminDashboard.jsx` | React component with hooks |
| `messages.html` | `src/pages/Messages.jsx` | Combined with Alder chat |
| `assets/css/style.css` | `src/index.css` + Tailwind | Converted to Tailwind classes |
| `assets/js/supabase.js` | `src/lib/supabase.js` | ES module export |
| `auth.js` | `src/contexts/AuthContext.jsx` | React Context + hooks |

## CSS Migration

### Colors
```css
/* Old CSS Variables */
--gold: #f5c200;
--green: #1a6b30;

/* New Tailwind */
className="bg-gold text-green-brand"
```

### Layout
```css
/* Old */
.app-layout { display: flex; min-height: 100vh; }
.sidebar { width: 260px; /* ... */ }

/* New */
className="flex min-h-screen"
className="w-64 flex flex-col"
```

### Shadows
```css
/* Old */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);

/* New */
className="shadow-card"
```

## JavaScript Migration

### Supabase Queries
```javascript
// Old
const { data } = await sb
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// New (same, but in React useEffect)
useEffect(() => {
  async function loadData() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    setProfile(data)
  }
  loadData()
}, [userId])
```

### Event Handlers
```javascript
// Old
document.getElementById('btn-google').addEventListener('click', async () => {
  // ...
});

// New
<Button onClick={handleGoogleSignIn}>
  Continue with Google
</Button>
```

## Alder the Lion Chatbot Migration

The chatbot is now a React component with:
- Framer Motion animations
- useState for chat state
- useEffect for greeting timer
- Proper cleanup on unmount

## Routing Changes

| URL Pattern | Before | After |
|-------------|--------|-------|
| `/` | index.html (login) | Redirects to appropriate dashboard |
| `/login` | index.html | Login.jsx component |
| `/researcher` | researcher.html | ResearcherDashboard.jsx |
| `/analyst` | analyst.html | AnalystDashboard.jsx |
| `/admin` | admin.html | AdminDashboard.jsx |
| `/messages` | messages.html | Messages.jsx |

## Build Process

### Before
- No build step
- Files served directly
- CDN dependencies

### After
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Before
Hardcoded in `supabase.js`:
```javascript
const SUPABASE_URL = "https://..."
```

### After
Can use environment variables:
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
```

Create `.env`:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## Testing the Migration

1. Compare visual appearance
2. Test all authentication flows
3. Verify role-based access
4. Check messaging functionality
5. Test Alder chatbot
6. Verify responsive design on mobile

## Performance Improvements

1. **Code Splitting**: Vite automatically splits chunks
2. **Tree Shaking**: Unused code is eliminated
3. **CSS Purging**: Tailwind only includes used styles
4. **Asset Optimization**: Vite optimizes images and assets
5. **HMR**: Fast development with Hot Module Replacement

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- CSS Grid and Flexbox
- No IE11 support

## Rollback Plan

If needed, the original HTML files remain untouched. Simply serve them from the original location.

## Next Steps

1. Set up the project: `npm install`
2. Copy assets to `public/`
3. Run dev server: `npm run dev`
4. Test all functionality
5. Deploy when ready

## Questions?

Refer to:
- `README.md` for setup instructions
- `src/lib/supabase.js` for backend configuration
- Component files for UI patterns
- `tailwind.config.js` for theme customization
