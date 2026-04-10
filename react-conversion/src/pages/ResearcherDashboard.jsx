import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, STATUS_LABELS, SERVICES } from '../lib/supabase'
import { formatDate, cn } from '../lib/utils'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import {
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter,
  ChevronRight,
  MessageSquare,
  Upload,
  X
} from 'lucide-react'

export default function ResearcherDashboard() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)

  // New request form state
  const [newRequest, setNewRequest] = useState({
    service_type: SERVICES[0],
    title: '',
    description: '',
  })

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('researcher_id', profile?.id)
      .order('created_at', { ascending: false })

    if (data) {
      setRequests(data)
      setStats({
        total: data.length,
        pending: data.filter(r => ['submitted', 'under_review'].includes(r.status)).length,
        inProgress: data.filter(r => r.status === 'in_progress').length,
        completed: data.filter(r => r.status === 'completed').length,
      })
    }
    setLoading(false)
  }

  async function handleSubmitRequest() {
    if (!newRequest.title) return

    const { error } = await supabase
      .from('service_requests')
      .insert({
        researcher_id: profile.id,
        service_type: newRequest.service_type,
        title: newRequest.title,
        description: newRequest.description,
        status: 'submitted',
      })

    if (!error) {
      setIsNewRequestOpen(false)
      setNewRequest({ service_type: SERVICES[0], title: '', description: '' })
      loadRequests()
    }
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="gold"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>My Requests</CardTitle>
            <Button onClick={() => setIsNewRequestOpen(true)} variant="gold">
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none bg-white"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <h3 className="text-gray-600 font-medium mb-1">No requests yet</h3>
                      <p className="text-sm text-gray-400">Submit your first request to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{req.title}</div>
                        <div className="text-sm text-gray-500">{req.id.slice(0, 8)}...</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{req.service_type}</td>
                      <td className="py-4 px-4">
                        <Badge status={req.status} />
                      </td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(req.created_at)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Request Modal */}
      <Modal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        title="New Service Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSubmitRequest}>
              Submit Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Type</label>
            <select
              value={newRequest.service_type}
              onChange={(e) => setNewRequest({ ...newRequest, service_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none"
            >
              {SERVICES.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newRequest.title}
              onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              placeholder="Brief title for your request"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              placeholder="Provide details about your request..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}