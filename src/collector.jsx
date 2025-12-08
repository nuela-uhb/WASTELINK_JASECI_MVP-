import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useWasteLink } from '../../context/WasteLinkContext.jsx'
import StatsCard from '../../components/Common/StatsCard.jsx'
import TaskCard from '../../components/Collector/TaskCard.jsx'
import ActiveTaskCard from '../../components/Collector/ActiveTaskCard.jsx'
import LocationTracker from '../../components/Collector/LocationTracker.jsx'
import MapView from '../../components/Common/MapView.jsx'
import Loader from '../../components/Common/Loader.jsx'
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon
} from '@heroicons/react/outline'

export default function CollectorDashboard() {
  const { user } = useAuth()
  const { collectorTasks, wasteRequests, systemMetrics, loading } = useWasteLink()
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedTasks: 0,
    activeTasks: 0,
    efficiency: 0
  })

  useEffect(() => {
    const completed = collectorTasks.filter(t => t.status === 'completed').length
    const active = collectorTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length
    const earnings = completed * 250 // Mock calculation
    const efficiency = completed > 0 ? Math.round((completed / (completed + active)) * 100) : 0

    setStats({
      totalEarnings: earnings,
      completedTasks: completed,
      activeTasks: active,
      efficiency: efficiency
    })
  }, [collectorTasks])

  const activeTask = collectorTasks.find(t => t.status === 'in_progress')
  const pendingTasks = collectorTasks.filter(t => t.status === 'assigned')

  if (loading && collectorTasks.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Collector {user?.name}!</h1>
        <p className="text-gray-600">Manage your waste collection tasks and track your performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`Ksh ${stats.totalEarnings}`}
          icon={CurrencyDollarIcon}
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircleIcon}
        />
        <StatsCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon={TruckIcon}
        />
        <StatsCard
          title="Efficiency"
          value={`${stats.efficiency}%`}
          change="This month"
          trend="up"
          icon={ClockIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Task & Pending Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {activeTask ? (
            <ActiveTaskCard task={activeTask} />
          ) : pendingTasks.length > 0 ? (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Assigned Tasks</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="text-center py-8">
                  <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tasks</h3>
                  <p className="text-gray-600">You'll be notified when new tasks are assigned to you.</p>
                </div>
              </div>
            </div>
          )}

          {/* Available Requests */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Available Pickup Requests</h3>
            </div>
            <div className="card-body">
              {wasteRequests
                .filter(r => r.status === 'pending')
                .slice(0, 3)
                .map(request => (
                  <div key={request.id} className="p-4 border border-gray-200 rounded-lg mb-3 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Request #{request.id.slice(0, 8)}</span>
                          <span className="badge badge-info">{request.wasteType}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.location}</p>
                        <p className="text-xs text-gray-500">Posted {new Date(request.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">Ksh 250</div>
                        <button className="btn-primary text-sm mt-2">
                          Accept Task
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Location Tracker */}
          <LocationTracker />

          {/* AI Optimized Route */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">AI Optimized Route</h3>
            </div>
            <div className="card-body">
              <MapView 
                markers={[
                  { position: [-1.2921, 36.8219], popup: 'Current Location' },
                  ...wasteRequests
                    .filter(r => r.status === 'assigned' || r.status === 'pending')
                    .slice(0, 3)
                    .map((r, i) => ({
                      position: r.location || [-1.2921 + (i * 0.001), 36.8219 + (i * 0.001)],
                      popup: `Stop ${i + 1}: ${r.wasteType}`
                    }))
                ]}
              />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Distance:</span>
                  <span className="font-medium">8.5 km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium">45 mins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fuel Savings:</span>
                  <span className="font-medium text-green-600">~15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Performance Tips</h3>
            </div>
            <div className="card-body">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">✓</div>
                  <p className="ml-3 text-sm text-gray-600">Complete tasks within estimated time for bonus</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">✓</div>
                  <p className="ml-3 text-sm text-gray-600">Follow AI route for optimal efficiency</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">✓</div>
                  <p className="ml-3 text-sm text-gray-600">Maintain 4.5+ rating for premium tasks</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">✓</div>
                  <p className="ml-3 text-sm text-gray-600">Weekday mornings have highest demand</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}