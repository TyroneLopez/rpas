import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ROLES } from './lib/supabase'

// Layouts
import AppLayout from './layouts/AppLayout'

// Pages
import Login from './pages/Login'
import ResearcherDashboard from './pages/ResearcherDashboard'
import AnalystDashboard from './pages/AnalystDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Messages from './pages/Messages'

// Protected Route component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading, isApproved } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isApproved) {
    return <Navigate to="/login?msg=pending" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    // Redirect to appropriate dashboard based on role
    if (profile?.role === ROLES.ADMIN) return <Navigate to="/admin" replace />
    if (profile?.role === ROLES.ANALYST) return <Navigate to="/analyst" replace />
    return <Navigate to="/researcher" replace />
  }

  return children
}

// Role-based redirect for root path
function RootRedirect() {
  const { user, profile, loading, isApproved } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user || !isApproved) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role === ROLES.ADMIN) return <Navigate to="/admin" replace />
  if (profile?.role === ROLES.ANALYST) return <Navigate to="/analyst" replace />
  return <Navigate to="/researcher" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      <Route path="/researcher" element={
        <ProtectedRoute allowedRoles={[ROLES.RESEARCHER]}>
          <AppLayout>
            <ResearcherDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/analyst" element={
        <ProtectedRoute allowedRoles={[ROLES.ANALYST]}>
          <AppLayout>
            <AnalystDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute>
          <AppLayout>
            <Messages />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App