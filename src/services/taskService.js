// Collector Task Service
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Get assigned tasks for collector
export const getCollectorTasks = async (collectorId, status = null) => {
  try {
    const params = status ? { status } : {}
    const response = await axios.get(`${API_BASE}/tasks/collector/${collectorId}`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching collector tasks:', error)
    throw error
  }
}

// Get task details
export const getTaskDetails = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE}/tasks/${taskId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching task details:', error)
    throw error
  }
}

// Start task (collector on their way)
export const startTask = async (taskId, collectorId) => {
  try {
    const response = await axios.put(`${API_BASE}/tasks/${taskId}/start`, {
      collectorId,
      startedAt: new Date(),
      status: 'IN_PROGRESS',
    })

    return response.data
  } catch (error) {
    console.error('Error starting task:', error)
    throw error
  }
}

// Submit waste details (weight, images, classification)
export const submitWasteDetails = async (taskId, wasteData) => {
  try {
    const formData = new FormData()
    formData.append('taskId', taskId)
    formData.append('wasteWeight', wasteData.wasteWeight) // in kg
    formData.append('wasteType', wasteData.wasteType)
    formData.append('description', wasteData.description || '')

    // Add images
    if (wasteData.images && wasteData.images.length > 0) {
      wasteData.images.forEach((image, index) => {
        formData.append(`images`, image)
      })
    }

    // Add classification if pre-classified
    if (wasteData.classification) {
      formData.append('classification', JSON.stringify(wasteData.classification))
    }

    const response = await axios.post(`${API_BASE}/tasks/${taskId}/waste-details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error submitting waste details:', error)
    throw error
  }
}

// Complete task
export const completeTask = async (taskId, completionData) => {
  try {
    const response = await axios.put(`${API_BASE}/tasks/${taskId}/complete`, {
      collectorId: completionData.collectorId,
      completedAt: new Date(),
      status: 'COMPLETED',
      recyclerName: completionData.recyclerName,
      wasteWeight: completionData.wasteWeight,
      wasteType: completionData.wasteType,
    })

    return response.data
  } catch (error) {
    console.error('Error completing task:', error)
    throw error
  }
}

// Update real-time location
export const updateCollectorLocation = async (taskId, latitude, longitude) => {
  try {
    const response = await axios.put(`${API_BASE}/tracking/${taskId}/location`, {
      latitude,
      longitude,
      updatedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

// Get collector's task history
export const getCollectorTaskHistory = async (collectorId, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/tasks/collector/${collectorId}/history`, {
      params: filters,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching task history:', error)
    throw error
  }
}

// Get collector performance metrics
export const getCollectorPerformance = async (collectorId) => {
  try {
    const response = await axios.get(`${API_BASE}/collectors/${collectorId}/performance`)
    return response.data
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    throw error
  }
}

// Generate collector report
export const generateCollectorReport = async (collectorId, startDate, endDate) => {
  try {
    const response = await axios.post(`${API_BASE}/reports/collector`, {
      collectorId,
      startDate,
      endDate,
      generatedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error generating report:', error)
    throw error
  }
}
