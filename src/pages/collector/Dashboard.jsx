import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, MapPin, BarChart3 } from 'lucide-react'
import { getCollectorTasks } from '../../services/taskService'
import TaskSubmission from '../../components/Collector/TaskSubmission'
import toast from 'react-hot-toast'

export default function CollectorDashboard() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock collector data - replace with context/auth
  const collector = {
    id: 'collector_1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-0101',
    vehicle: 'Motorcycle',
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      // Mock data - replace with real API call
      const mockTasks = [
        {
          id: 'task_1',
          residentId: 'resident_1',
          address: '123 Main St, Apt 101',
          wasteType: 'plastic',
          estimatedVolume: '0.5',
          urgencyLevel: 'medium',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task_2',
          residentId: 'resident_2',
          address: '456 Oak Ave, Suite 200',
          wasteType: 'mixed',
          estimatedVolume: '1.2',
          urgencyLevel: 'high',
          status: 'ACCEPTED',
          createdAt: new Date().toISOString(),
        },
      ]
      setTasks(mockTasks)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load tasks')
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome, {collector.name}!</h1>
          <p className="text-emerald-100">Manage your pickup tasks and earn rewards</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Active Tasks</p>
            <p className="text-3xl font-bold text-primary-600">
              {tasks.filter((t) => t.status === 'ACCEPTED').length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Pending Requests</p>
            <p className="text-3xl font-bold text-amber-600">
              {tasks.filter((t) => t.status === 'PENDING').length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Completed Today</p>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="inline w-5 h-5 mr-2" />
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'submit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="inline w-5 h-5 mr-2" />
            Submit Details
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            My Reports
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {loading ? (
                <p>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-gray-600">No tasks available at the moment</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="card p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">📍 {task.address}</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Waste Type: <span className="font-semibold">{task.wasteType}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Volume: <span className="font-semibold">{task.estimatedVolume} m³</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Urgency: <span className="font-semibold capitalize">{task.urgencyLevel}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="btn-primary w-full mt-3"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'submit' && selectedTask ? (
            <TaskSubmission task={selectedTask} collector={collector} />
          ) : activeTab === 'submit' ? (
            <div className="card p-8 text-center">
              <CheckCircle className="w-16 h-16 text-primary-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Select a Task</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select a task from your task list to submit waste details.
              </p>
            </div>
          ) : null}

          {activeTab === 'reports' && (
            <div className="card p-8">
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your Performance Reports</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Reports will be generated once you complete tasks. Track your stats, earnings, and environmental impact here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
