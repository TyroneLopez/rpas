import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { Bell, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const pageTitles = {
  '/researcher': { title: 'Researcher Dashboard', subtitle: 'Submit and track your research service requests' },
  '/analyst': { title: 'Analyst Dashboard', subtitle: 'Manage assigned requests and communicate with researchers' },
  '/admin': { title: 'Admin Dashboard', subtitle: 'Manage users, requests, and system settings' },
  '/messages': { title: 'Messages', subtitle: 'Communicate with your team' },
}

export default function Topbar() {
  const { profile } = useAuth()
  const location = useLocation()

  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: '' }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{pageInfo.title}</h1>
          {pageInfo.subtitle && (
            <p className="text-sm text-gray-500">{pageInfo.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/messages"
            className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </Link>
          <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}