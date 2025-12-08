import React, { useState, useEffect } from 'react'
import { Users, CheckCircle, Zap, TrendingUp } from 'lucide-react'
import { getSystemStats, getDailyTasks } from '../../services/adminService'
import CollectorManagement from '../../components/Admin/CollectorManagement'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [dailyTasks, setDailyTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Mock data - replace with real API calls
      const mockStats = {
        totalCollectors: 45,
        activeCollectors: 38,
        pendingApprovals: 3,
        tasksToday: 24,
        completedToday: 18,
        totalWeight: 450,
        carbonSaved: 225,
      }
      setStats(mockStats)

      const mockTasks = [
        { id: 1, resident: 'John Doe', collector: 'Jane Smith', status: 'COMPLETED', weight: 12.5 },
        { id: 2, resident: 'Alice Johnson', collector: 'Bob Wilson', status: 'IN_PROGRESS', weight: null },
        { id: 3, resident: 'Michael Brown', collector: 'Sarah Davis', status: 'PENDING', weight: null },
      ]
      setDailyTasks(mockTasks)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h1 className="text-4xl font-bold mb-2">System Dashboard</h1>
          <p className="text-blue-100">Manage users, tasks, and system performance</p>
        </div>

        {/* Stats Cards */}
        {stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  <p className="text-gray-600 text-sm">Active Today</p>
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
                <Zap className="w-12 h-12 text-blue-300" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Carbon Saved (kg)</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.carbonSaved}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-300" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('collectors')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'collectors'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Collectors
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'daily'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily Tasks
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">System Summary</h3>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-primary-600 pl-4">
                    <p className="text-gray-600 text-sm">Waste Collected Today</p>
                    <p className="text-3xl font-bold text-primary-600">{stats.totalWeight} kg</p>
                  </div>
                  <div className="border-l-4 border-emerald-600 pl-4">
                    <p className="text-gray-600 text-sm">CO₂ Saved Today</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.carbonSaved} kg</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="text-gray-600 text-sm">Completed Tasks</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.completedToday}</p>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4">
                    <p className="text-gray-600 text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {Math.round((stats.completedToday / stats.tasksToday) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collectors' && <CollectorManagement />}

          {activeTab === 'daily' && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Today's Tasks</h3>
              {dailyTasks.length === 0 ? (
                <p className="text-gray-600">No tasks yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Resident</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Collector</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyTasks.map((task) => (
                        <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{task.resident}</td>
                          <td className="py-3 px-4 text-gray-900">{task.collector}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{task.weight || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="card p-8">
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">System Reports</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Generate detailed reports on system performance, collector metrics, and environmental impact.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
