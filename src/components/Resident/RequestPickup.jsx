import React, { useState } from 'react'
import { MapPin, Clock, AlertCircle } from 'lucide-react'
import { createPickupRequest } from '../../services/requestService'
import { notifyCollectors, findNearestCollectors } from '../../services/notificationService'
import toast from 'react-hot-toast'

export default function RequestPickup({ resident }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    latitude: null,
    longitude: null,
    urgencyLevel: 'medium',
    preferredTime: '',
    specialInstructions: '',
    contactPhone: resident?.phone || '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }))
          toast.success('Location retrieved successfully')
        },
        (error) => {
          toast.error('Failed to get location. Please enter manually.')
        }
      )
    } else {
      toast.error('Geolocation not supported. Please enter location manually.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.address || !formData.latitude || !formData.longitude) {
        toast.error('Please provide a location')
        setLoading(false)
        return
      }

      // Create pickup request
      const request = await createPickupRequest({
        residentId: resident.id,
        ...formData,
      })

      toast.success('Request created successfully!')

      // Find nearest collectors
      const nearestCollectors = await findNearestCollectors(
        formData.latitude,
        formData.longitude,
        5 // 5 km radius
      )

      // Auto-notify nearest collectors
      if (nearestCollectors.length > 0) {
        await notifyCollectors(request.id, {
          address: formData.address,
          wasteType: formData.wasteType,
          urgencyLevel: formData.urgencyLevel,
        }, nearestCollectors)

        toast.success(`Notified ${nearestCollectors.length} nearby collectors`)
      }

      // Reset form
      setFormData({
        address: '',
        latitude: null,
        longitude: null,
        urgencyLevel: 'medium',
        preferredTime: '',
        specialInstructions: '',
        contactPhone: resident?.phone || '',
      })
    } catch (error) {
      toast.error(error.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Waste Pickup</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            <MapPin className="inline w-5 h-5 mr-2" />
            Pickup Location
          </label>
          <div className="space-y-3">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address or coordinates"
              className="input-field"
            />
            <button
              type="button"
              onClick={handleGetLocation}
              className="btn-secondary w-full"
            >
              📍 Use My Current Location
            </button>
            {formData.latitude && (
              <p className="text-sm text-gray-600">
                Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            <AlertCircle className="inline w-5 h-5 mr-2" />
            Urgency Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['low', 'medium', 'high'].map((level) => (
              <label key={level} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="urgencyLevel"
                  value={level}
                  checked={formData.urgencyLevel === level}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="ml-2 capitalize font-medium text-gray-700">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Time */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            <Clock className="inline w-5 h-5 mr-2" />
            Preferred Pickup Time
          </label>
          <input
            type="datetime-local"
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">📱 Contact Number</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            placeholder="Your phone number"
            className="input-field"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">📝 Special Instructions</label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            placeholder="Any special instructions for the collector?"
            rows="4"
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating Request...' : '✓ Request Pickup'}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6 text-center">
        Nearby collectors will be notified automatically once you submit your request.
      </p>
    </div>
  )
}
