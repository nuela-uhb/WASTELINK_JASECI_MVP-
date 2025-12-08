import { useState } from 'react'
import Modal from '../Common/Modal.jsx'

export default function RequestModal({ open, onClose, onSubmit, loading, wasteTypes, volumeOptions }) {
  const [formData, setFormData] = useState({
    wasteType: '',
    volume: '',
    notes: '',
    urgency: 'standard',
    location: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Modal open={open} onClose={onClose} title="Request Waste Pickup" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waste Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wasteTypes.map(type => (
              <button
                type="button"
                key={type.id}
                onClick={() => handleChange({ target: { name: 'wasteType', value: type.id } })}
                className={`
                  p-3 rounded-lg border text-center transition-colors
                  ${formData.wasteType === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className={`badge ${type.color} mb-2`}>
                  {type.name}
                </span>
                <p className="text-xs text-gray-600 mt-1">AI-classified waste</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Volume
          </label>
          <div className="grid grid-cols-3 gap-3">
            {volumeOptions.map(volume => (
              <button
                type="button"
                key={volume.id}
                onClick={() => handleChange({ target: { name: 'volume', value: volume.id } })}
                className={`
                  p-3 rounded-lg border text-center transition-colors
                  ${formData.volume === volume.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-lg font-medium text-gray-900">
                  {volume.id === 'small' && 'S'}
                  {volume.id === 'medium' && 'M'}
                  {volume.id === 'large' && 'L'}
                </div>
                <div className="text-xs text-gray-500">{volume.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
            Urgency
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            className="input-field"
          >
            <option value="standard">Standard (Within 24 hours)</option>
            <option value="urgent">Urgent (Within 4 hours)</option>
            <option value="emergency">Emergency (Within 1 hour)</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your apartment number or specific location"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions for the collector..."
            className="input-field"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  )
}