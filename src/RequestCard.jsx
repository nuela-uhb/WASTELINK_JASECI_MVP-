import { useState } from 'react'
import { TrashIcon, ClockIcon, MapPinIcon } from '@heroicons/react/outline'
import RequestModal from './RequestModal.jsx'
import { useWasteLink } from '../../context/WasteLinkContext.jsx'

const wasteTypes = [
  { id: 'organic', name: 'Organic', color: 'bg-green-100 text-green-800' },
  { id: 'plastic', name: 'Plastic', color: 'bg-blue-100 text-blue-800' },
  { id: 'metal', name: 'Metal', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'glass', name: 'Glass', color: 'bg-purple-100 text-purple-800' },
  { id: 'mixed', name: 'Mixed', color: 'bg-gray-100 text-gray-800' },
]

const volumeOptions = [
  { id: 'small', name: 'Small (1-5 kg)' },
  { id: 'medium', name: 'Medium (5-20 kg)' },
  { id: 'large', name: 'Large (20+ kg)' },
]

export default function RequestCard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { createWasteRequest, loading } = useWasteLink()

  const handleSubmit = async (data) => {
    try {
      await createWasteRequest(data)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to create request:', error)
    }
  }

  return (
    <>
      <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <TrashIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Request Waste Pickup</h3>
                <p className="text-sm text-gray-500">Schedule a pickup for your waste materials</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <ClockIcon className="h-5 w-5" />
              <span className="text-sm">Quick request</span>
            </div>
          </div>
        </div>
      </div>

      <RequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
        wasteTypes={wasteTypes}
        volumeOptions={volumeOptions}
      />
    </>
  )
}