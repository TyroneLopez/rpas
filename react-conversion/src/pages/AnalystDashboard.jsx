import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, STATUS_LABELS } from '../lib/supabase'
import { formatDate, cn } from '../lib/utils'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Search,
  MessageSquare,
  User,
  ChevronRight,
  FileText
} from 'lucide-react'

export default function AnalystDashboard() {
  const { profile } = useAuth()
  const [assignedRequests, setAssignedRequests] = useState([])
  const [openPool, setOpenPool] = useState([])
  const [activeTab, setActiveTab] = useState('assigned') // 'assigned' or 'pool'
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)

    // Load assigned requests
    const { data: assigned } = await supabase
      .from('service_requests')
      .select('*, researcher:researcher_id(full_name, email)')
      .eq('analyst_id', profile?.id)
      .order('created_at', { ascending: false })

    // Load open pool (unassigned requests)
    const { data: pool } = await supabase
      .from('service_requests')
      .select('*, researcher:researcher_id(full_name, email)')
      .is('analyst_id', null)
      .eq('status', 'submitted')
      .order('created_at', { ascending: false })

    if (assigned) {
      setAssignedRequests(assigned)
      setStats({
        assigned: assigned.length,
        inProgress: assigned.filter(r => r.status === 'in_progress').length,
        completed: assigned.filter(r => r.status === 'completed').length,
        total: assigned.length + (pool?.length || 0),
      })
    }

    if (pool) {
      setOpenPool(pool)
    }

    setLoading(false)
  }

  async function handleAcceptRequest(requestId) {
    const { error } = await supabase
      .from('service_requests')
      .update({
        analyst_id: profile.id,
        status: 'under_review',
      })
      .eq('id', requestId)

    if (!error) {
      loadRequests()
    }
  }

  async function handleUpdateStatus(requestId, newStatus) {
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (!error) {
      loadRequests()
      setIsDetailOpen(false)
    }
  }

  const displayRequests = activeTab === 'assigned' ? assignedRequests : openPool

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned to Me"
          value={stats.assigned}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="gold"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Handled"
          value={stats.total}
          icon={FileText}
          color="gray"
        />
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('assigned')}
              className={cn(
                'pb-3 text-sm font-semibold border-b-2 transition-colors',
                activeTab === 'assigned'
                  ? 'text-green-brand border-green-brand'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              )}
            >
              My Assignments ({assignedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={cn(
                'pb-3 text-sm font-semibold border-b-2 transition-colors',
                activeTab === 'pool'
                  ? 'text-green-brand border-green-brand'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              )}
            >
              Open Pool ({openPool.length})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Researcher</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : displayRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="text-4xl mb-3">{activeTab === 'pool' ? '📭' : '✅'}</div>
                      <h3 className="text-gray-600 font-medium mb-1">
                        {activeTab === 'pool' ? 'No open requests' : 'No assigned requests'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {activeTab === 'pool'
                          ? 'All requests have been assigned'
                          : 'Check the Open Pool to accept new requests'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{req.title}</div>
                        <div className="text-sm text-gray-500">{req.id.slice(0, 8)}...</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-sm font-semibold text-green-dark">
                            {req.researcher?.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-gray-700">{req.researcher?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{req.service_type}</td>
                      <td className="py-4 px-4">
                        <Badge status={req.status} />
                      </td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(req.created_at)}</td>
                      <td className="py-4 px-4">
                        {activeTab === 'pool' ? (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(req.id)}
                          >
                            Accept
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(req)
                                setIsDetailOpen(true)
                              }}
                            >
                              View
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Request Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Service Type</label>
                <p className="text-gray-900">{selectedRequest.service_type}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <div><Badge status={selectedRequest.status} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Researcher</label>
                <p className="text-gray-900">{selectedRequest.researcher?.full_name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Submitted</label>
                <p className="text-gray-900">{formatDate(selectedRequest.created_at)}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
              <p className="text-gray-900 font-medium">{selectedRequest.title}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
              <p className="text-gray-700">{selectedRequest.description || 'No description provided'}</p>
            </div>

            {/* Status Actions */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {['under_review', 'in_progress', 'for_revision', 'completed'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedRequest.status === status ? 'primary' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedRequest.id, status)}
                    disabled={selectedRequest.status === status}
                  >
                    {STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}