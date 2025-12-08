// Notification Service - Auto-notify nearest collector
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Find nearest collectors based on geolocation
export const findNearestCollectors = async (latitude, longitude, radiusKm = 5) => {
  try {
    const response = await axios.get(`${API_BASE}/collectors/nearest`, {
      params: {
        latitude,
        longitude,
        radius: radiusKm,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error finding nearest collectors:', error)
    throw error
  }
}

// Auto-notify collectors of new pickup request
export const notifyCollectors = async (requestId, pickupDetails, nearestCollectors) => {
  try {
    const notifications = nearestCollectors.map((collector) => ({
      collectorId: collector.id,
      requestId,
      type: 'NEW_PICKUP_REQUEST',
      title: 'New Pickup Request',
      message: `New waste pickup request at ${pickupDetails.address}`,
      pickupDetails,
      createdAt: new Date(),
      read: false,
      accepted: false,
    }))

    // Send notifications via API
    const response = await axios.post(`${API_BASE}/notifications/batch`, {
      notifications,
    })

    return response.data
  } catch (error) {
    console.error('Error notifying collectors:', error)
    throw error
  }
}

// Update notification status (read, accepted, rejected)
export const updateNotificationStatus = async (notificationId, status) => {
  try {
    const response = await axios.put(`${API_BASE}/notifications/${notificationId}`, {
      status,
    })
    return response.data
  } catch (error) {
    console.error('Error updating notification:', error)
    throw error
  }
}

// Get collector's notifications
export const getCollectorNotifications = async (collectorId) => {
  try {
    const response = await axios.get(`${API_BASE}/notifications/collector/${collectorId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

// Accept pickup task (collector)
export const acceptPickupTask = async (notificationId, collectorId) => {
  try {
    const response = await axios.post(`${API_BASE}/notifications/${notificationId}/accept`, {
      collectorId,
    })
    return response.data
  } catch (error) {
    console.error('Error accepting task:', error)
    throw error
  }
}

// Reject pickup task (collector)
export const rejectPickupTask = async (notificationId, collectorId) => {
  try {
    const response = await axios.post(`${API_BASE}/notifications/${notificationId}/reject`, {
      collectorId,
    })
    return response.data
  } catch (error) {
    console.error('Error rejecting task:', error)
    throw error
  }
}
