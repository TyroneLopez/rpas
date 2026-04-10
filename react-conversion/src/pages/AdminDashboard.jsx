import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, ROLES, STATUS_LABELS } from '../lib/supabase'
import { formatDate, cn, getInitials } from '../lib/utils'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import {
  Users,
  FileText,
  UserCheck,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
} from 'lucide-react'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalRequests: 0,
    activeRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // Load users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Load requests
    const { data: requestsData } = await supabase
      .from('service_requests')
      .select('*, researcher:researcher_id(full_name), analyst:analyst_id(full_name)')
      .order('created_at', { ascending: false })

    if (usersData) {
      setUsers(usersData)
      setStats((s) => ({
        ...s,
        totalUsers: usersData.length,
        pendingUsers: usersData.filter(u => u.status === 'pending').length,
      }))
    }

    if (requestsData) {
      setRequests(requestsData)
      setStats((s) => ({
        ...s,
        totalRequests: requestsData.length,
        activeRequests: requestsData.filter(r =>
          ['submitted', 'under_review', 'in_progress'].includes(r.status)
        ).length,
      }))
    }

    setLoading(false)
  }

  async function handleApproveUser(userId) {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', userId)

    if (!error) {
      loadData()
    }
  }

  async function handleRejectUser(userId) {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', userId)

    if (!error) {
      loadData()
    }
  }

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRequests = requests.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.researcher?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingUsers}
          icon={Clock}
          color="gold"
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Active Requests"
          value={stats.activeRequests}
          icon={UserCheck}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  'pb-3 text-sm font-semibold border-b-2 transition-colors',
                  activeTab === 'users'
                    ? 'text-green-brand border-green-brand'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={cn(
                  'pb-3 text-sm font-semibold border-b-2 transition-colors',
                  activeTab === 'requests'
                    ? 'text-green-brand border-green-brand'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                All Requests ({requests.length})
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="text-4xl mb-3">👥</div>
                        <h3 className="text-gray-600 font-medium">No users found</h3>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-sm font-bold text-green-dark">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                getInitials(user.full_name)
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{user.full_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize',
                            user.role === 'admin' && 'bg-purple-100 text-purple-700',
                            user.role === 'analyst' && 'bg-blue-100 text-blue-700',
                            user.role === 'researcher' && 'bg-gray-100 text-gray-700'
                          )}>
                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge status={user.status} />
                        </td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="py-4 px-4">
                          {user.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveUser(user.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRejectUser(user.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Researcher</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analyst</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">Loading...</td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <h3 className="text-gray-600 font-medium">No requests found</h3>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{req.title}</div>
                          <div className="text-sm text-gray-500">{req.service_type}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{req.researcher?.full_name}</td>
                        <td className="py-4 px-4 text-gray-600">{req.analyst?.full_name || '—'}</td>
                        <td className="py-4 px-4">
                          <Badge status={req.status} />
                        </td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(req.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}