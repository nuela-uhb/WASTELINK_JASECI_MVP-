import React, { useState, useEffect } from 'react'
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import {
  getAllCollectors,
  approveCollector,
  rejectCollector,
  activateCollector,
  deactivateCollector,
  getSystemStats,
} from '../../services/adminService'
import toast from 'react-hot-toast'

export default function CollectorManagement() {
  const [collectors, setCollectors] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCollector, setSelectedCollector] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [collectorsData, statsData] = await Promise.all([
        getAllCollectors({ status: 'PENDING' }),
        getSystemStats(),
      ])
      setCollectors(collectorsData)
      setStats(statsData)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (collectorId) => {
    setActionInProgress(collectorId)
    try {
      await approveCollector(collectorId)
      toast.success('Collector approved!')
      setCollectors(collectors.filter((c) => c.id !== collectorId))
    } catch (error) {
      toast.error('Failed to approve collector')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleReject = async (collectorId) => {
    setActionInProgress(collectorId)
    try {
      await rejectCollector(collectorId, 'Not meeting requirements')
      toast.success('Collector rejected')
      setCollectors(collectors.filter((c) => c.id !== collectorId))
    } catch (error) {
      toast.error('Failed to reject collector')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleActivate = async (collectorId) => {
    setActionInProgress(collectorId)
    try {
      await activateCollector(collectorId)
      toast.success('Collector activated')
      loadData()
    } catch (error) {
      toast.error('Failed to activate collector')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDeactivate = async (collectorId) => {
    setActionInProgress(collectorId)
    try {
      await deactivateCollector(collectorId, 'Admin action')
      toast.success('Collector deactivated')
      loadData()
    } catch (error) {
      toast.error('Failed to deactivate collector')
    } finally {
      setActionInProgress(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Collectors</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalCollectors}</p>
              </div>
              <Users className="w-12 h-12 text-primary-300" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Collectors</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeCollectors}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-300" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tasks Today</p>
                <p className="text-3xl font-bold text-blue-600">{stats.tasksToday}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-300" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold text-amber-600">{collectors.length}</p>
              </div>
              <XCircle className="w-12 h-12 text-amber-300" />
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Collector Approvals</h3>

        {collectors.length === 0 ? (
          <p className="text-gray-600">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {collectors.map((collector) => (
              <div key={collector.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{collector.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      📧 {collector.email} | 📱 {collector.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {collector.address || 'Address not provided'}
                    </p>
                    {collector.vehicleType && (
                      <p className="text-sm text-gray-600 mt-1">
                        🚗 Vehicle: {collector.vehicleType}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(collector.id)}
                      disabled={actionInProgress === collector.id}
                      className="btn-success py-2 px-4"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(collector.id)}
                      disabled={actionInProgress === collector.id}
                      className="btn-secondary py-2 px-4"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
