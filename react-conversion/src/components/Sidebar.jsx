import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../lib/supabase'
import { getInitials } from '../lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
  UserCheck
} from 'lucide-react'

const navItems = {
  [ROLES.RESEARCHER]: [
    { path: '/researcher', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ],
  [ROLES.ANALYST]: [
    { path: '/analyst', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ],
  [ROLES.ADMIN]: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/requests', label: 'All Requests', icon: ClipboardList },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ],
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const role = profile?.role || ROLES.RESEARCHER
  const items = navItems[role] || navItems[ROLES.RESEARCHER]

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-green-brand flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-xl shadow-lg">
              🎓
            </div>
            <div>
              <div className="text-[11px] text-white/70 uppercase tracking-wider">Aldersgate College Inc.</div>
              <div className="text-sm font-semibold text-white">RPAS</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45 px-3 py-2">
            Menu
          </div>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-gold text-green-dark'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-sm font-bold text-green-dark">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                getInitials(profile?.full_name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-xs text-white/55 capitalize">{profile?.role}</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}