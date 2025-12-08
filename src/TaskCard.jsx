import { MapPinIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/outline'
import { useWasteLink } from '../../context/WasteLinkContext.jsx'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const wasteTypeColors = {
  organic: 'bg-green-100 text-green-800',
  plastic: 'bg-blue-100 text-blue-800',
  metal: 'bg-yellow-100 text-yellow-800',
  glass: 'bg-purple-100 text-purple-800',
  mixed: 'bg-gray-100 text-gray-800'
}

export default function TaskCard({ task }) {
  const { updateRequestStatus, loading } = useWasteLink()

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateRequestStatus(task.id, newStatus)
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const getStatusActions = () => {
    switch(task.status) {
      case 'assigned':
        return (
          <button
            onClick={() => handleStatusUpdate('in_progress')}
            className="btn-primary text-sm"
            disabled={loading}
          >
            Start Task
          </button>
        )
      case 'in_progress':
        return (
          <button
            onClick={() => handleStatusUpdate('completed')}
            className="btn-primary text-sm"
            disabled={loading}
          >
            Complete Task
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">Task #{task.id.slice(0, 8)}</h3>
              <span className={`badge ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`badge ${wasteTypeColors[task.wasteType]}`}>
                {task.wasteType}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Requested {new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">Ksh {task.estimatedEarnings || '250'}</div>
            <div className="text-sm text-gray-500">Estimated earnings</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{task.location || 'Apartment A101'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>Est. time: {task.estimatedTime || '30 mins'}</span>
          </div>
        </div>

        {task.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{task.notes}</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
            <span>Distance: {task.distance || '2.5'} km</span>
          </div>
          {getStatusActions()}
        </div>
      </div>
    </div>
  )
}