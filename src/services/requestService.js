// Resident Pickup Request Service
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create new pickup request
export const createPickupRequest = async (requestData) => {
  try {
    const response = await axios.post(`${API_BASE}/requests/create`, {
      residentId: requestData.residentId,
      address: requestData.address,
      latitude: requestData.latitude,
      longitude: requestData.longitude,
      wasteType: requestData.wasteType,
      estimatedVolume: requestData.estimatedVolume,
      urgencyLevel: requestData.urgencyLevel, // 'low', 'medium', 'high'
      preferredTime: requestData.preferredTime,
      specialInstructions: requestData.specialInstructions,
      contactPhone: requestData.contactPhone,
      createdAt: new Date(),
      status: 'PENDING', // PENDING, ACCEPTED, IN_PROGRESS, COMPLETED
    })

    return response.data
  } catch (error) {
    console.error('Error creating pickup request:', error)
    throw error
  }
}

// Get resident's pickup requests
export const getResidentRequests = async (residentId) => {
  try {
    const response = await axios.get(`${API_BASE}/requests/resident/${residentId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching requests:', error)
    throw error
  }
}

// Get request details
export const getRequestDetails = async (requestId) => {
  try {
    const response = await axios.get(`${API_BASE}/requests/${requestId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching request details:', error)
    throw error
  }
}

// Cancel pickup request
export const cancelRequest = async (requestId, reason = '') => {
  try {
    const response = await axios.put(`${API_BASE}/requests/${requestId}/cancel`, {
      reason,
      cancelledAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error cancelling request:', error)
    throw error
  }
}

// Rate collector after pickup
export const ratePickup = async (requestId, rating, feedback = '') => {
  try {
    const response = await axios.post(`${API_BASE}/requests/${requestId}/rate`, {
      rating, // 1-5 stars
      feedback,
      ratedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error rating pickup:', error)
    throw error
  }
}

// Get collector's real-time location
export const getCollectorLocation = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE}/tracking/collector/${taskId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching collector location:', error)
    throw error
  }
}

// Request history with filters
export const getRequestHistory = async (residentId, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/requests/resident/${residentId}/history`, {
      params: filters,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching request history:', error)
    throw error
  }
}
