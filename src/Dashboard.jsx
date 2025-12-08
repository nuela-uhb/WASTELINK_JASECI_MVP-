import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useWasteLink } from '../../context/WasteLinkContext.jsx'
import StatsCard from '../../components/Common/StatsCard.jsx'
import RequestCard from '../../components/Resident/RequestCard.jsx'
import HistoryCard from '../../components/Resident/HistoryCard.jsx'
import Loader from '../../components/Common/Loader.jsx'
import MapView from '../../components/Common/MapView.jsx'
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline'

export default function ResidentDashboard() {
  const { user } = useAuth()
  const { wasteRequests, systemMetrics, loading } = useWasteLink()
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    estimatedSavings: 0
  })

  useEffect(() => {
    if (wasteRequests.length > 0) {
      const total = wasteRequests.length
      const pending = wasteRequests.filter(r => r.status === 'pending').length
      const completed = wasteRequests.filter(r => r.status === 'completed').length
      const savings = completed * 50 // Mock calculation

      setStats({
        totalRequests: total,
        pendingRequests: pending,
        completedRequests: completed,
        estimatedSavings: savings
      })
    }
  }, [wasteRequests])

  const recentRequests = wasteRequests.slice(0, 5)

  if (loading && wasteRequests.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Manage your waste pickups and track your environmental impact.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={ChartBarIcon}
        />
        <StatsCard
          title="Pending"
          value={stats.pendingRequests}
          change={`${stats.totalRequests > 0 ? Math.round((stats.pendingRequests / stats.totalRequests) * 100) : 0}% of total`}
          trend="down"
          icon={ClockIcon}
        />
        <StatsCard
          title="Completed"
          value={stats.completedRequests}
          change={`${stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}% of total`}
          trend="up"
          icon={CheckCircleIcon}
        />
        <StatsCard
          title="Estimated Savings"
          value={`Ksh ${stats.estimatedSavings}`}
          description="Environmental impact"
          icon={CurrencyDollarIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Card */}
        <div className="lg:col-span-2 space-y-6">
          <RequestCard />
          
          {/* Recent Requests */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
            </div>
            <div className="card-body">
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map(request => (
                    <HistoryCard key={request.id} request={request} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No requests yet. Create your first waste pickup request!</p>
              )}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Collection Coverage</h3>
            </div>
            <div className="card-body p-0">
              <MapView 
                markers={wasteRequests
                  .filter(r => r.location)
                  .map(r => ({
                    position: r.location,
                    popup: `${r.wasteType} - ${r.status}`
                  }))
                }
              />
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Segregation Tip:</span> Separate plastic bottles from caps for better recycling
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Optimal Timing:</span> Request pickups between 9 AM - 11 AM for faster service
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <span className="font-medium">Eco Impact:</span> Your recycling has saved approximately 25kg of CO₂ this month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}