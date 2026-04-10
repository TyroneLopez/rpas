# RPAS — React + Tailwind Conversion

A modern React-based conversion of the Research Planning and Analytic Services (RPAS) portal for Aldersgate College Inc.

## 🚀 Tech Stack

- **React 18** - UI library with hooks and functional components
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Supabase** - Backend as a Service (auth, database, storage)
- **Framer Motion** - Animations (for Alder the Lion)
- **Lucide React** - Beautiful icon library
- **clsx + tailwind-merge** - Conditional class merging

## 📁 Project Structure

```
react-conversion/
├── index.html                 # Entry HTML file
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration with custom colors
├── vite.config.js           # Vite configuration
├── postcss.config.js        # PostCSS configuration
├── src/
│   ├── main.jsx             # React app entry point
│   ├── App.jsx              # Main router setup
│   ├── index.css            # Global styles + Tailwind directives
│   ├── lib/
│   │   ├── supabase.js      # Supabase client + constants
│   │   └── utils.js         # Utility functions (cn, formatDate, etc.)
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication context + useAuth hook
│   ├── components/
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Topbar.jsx       # Header with title
│   │   ├── AlderChatbot.jsx # AI chatbot widget
│   │   └── ui/              # Reusable UI components
│   │       ├── Button.jsx
│   │       ├── Badge.jsx
│   │       ├── Card.jsx
│   │       ├── Modal.jsx
│   │       └── StatCard.jsx
│   ├── layouts/
│   │   └── AppLayout.jsx    # Main app layout wrapper
│   └── pages/
│       ├── Login.jsx        # Authentication page
│       ├── ResearcherDashboard.jsx
│       ├── AnalystDashboard.jsx
│       ├── AdminDashboard.jsx
│       └── Messages.jsx     # Messaging interface
```

## 🎨 Design System

### Brand Colors
- **Gold**: `#F5C200` (Primary accent)
- **Green**: `#1A6B30` (Primary brand)
- **Green Dark**: `#145525` (Hover states)
- **Gold Light**: `#FEF3C7` (Backgrounds)

### Status Colors
- Submitted: Gray
- Under Review: Amber
- In Progress: Blue
- For Revision: Red
- Completed: Green
- Resubmitted: Purple

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd react-conversion
npm install
```

### 2. Configure Supabase

The Supabase configuration is already set up in `src/lib/supabase.js`:
- URL: `https://wkgacywvsndwiezqdcxj.supabase.co`
- Anon Key: included in the file

### 3. Copy Assets

Copy the `assets` folder from the original project to the new `public` folder:

```bash
mkdir -p public/assets
cp -r ../assets/Alder public/assets/
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## 🔑 Features

### Authentication
- Google OAuth sign-in
- Email/Password sign-up and sign-in
- Password reset functionality
- Account approval workflow

### Role-Based Dashboards

#### Researcher
- Submit new service requests
- Track request status
- View request history
- Real-time stats

#### Analyst
- View assigned requests
- Accept requests from open pool
- Update request status
- Communicate with researchers

#### Admin
- User management (approve/reject)
- View all requests
- System overview stats
- Role management

### Alder the Lion AI Chatbot
- Floating chat widget
- Webhook integration for AI responses
- Persistent across all pages
- Animated mascot with greeting

### Messaging
- Real-time chat between users
- AI assistant (Alder) chat
- Office inquiry system
- Message history

## 🌐 Environment Variables (Optional)

Create a `.env` file for environment-specific configuration:

```env
VITE_SUPABASE_URL=https://wkgacywvsndwiezqdcxj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Then update `src/lib/supabase.js` to use:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 📱 Responsive Design

The app is fully responsive:
- Mobile: Sidebar becomes overlay with hamburger menu
- Tablet: Adjusted layouts
- Desktop: Full sidebar with all features

## 🔧 Customization

### Tailwind Configuration

Edit `tailwind.config.js` to customize:
- Colors: Brand colors are already configured
- Fonts: Inter (sans) and Lora (serif) pre-configured
- Shadows: Custom shadows for cards and modals
- Animations: Alder's floating and pulse animations

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Sidebar.jsx` (if needed)

## 🚦 API Integration

The app uses Supabase for:
- Authentication (`supabase.auth`)
- Database queries (`supabase.from`)
- Real-time subscriptions (configured for messages)
- Edge Functions (for email sending)

## 📦 Dependencies

See `package.json` for full list. Key dependencies:

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@supabase/supabase-js": "^2.39.0",
  "tailwindcss": "^3.3.6",
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.294.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.1.0",
  "date-fns": "^3.0.0"
}
```

## 🐛 Debugging

- Check browser console for errors
- Verify Supabase connection in Network tab
- Ensure all assets are copied to `public/`

## 📄 License

Same as original project.

---

Built with ❤️ for Aldersgate College Inc.
