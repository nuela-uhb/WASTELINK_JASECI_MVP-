// Admin Management Service
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Get all registered collectors
export const getAllCollectors = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/collectors`, { params: filters })
    return response.data
  } catch (error) {
    console.error('Error fetching collectors:', error)
    throw error
  }
}

// Approve collector registration
export const approveCollector = async (collectorId) => {
  try {
    const response = await axios.put(`${API_BASE}/admin/collectors/${collectorId}/approve`, {
      status: 'APPROVED',
      approvedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error approving collector:', error)
    throw error
  }
}

// Reject collector registration
export const rejectCollector = async (collectorId, reason = '') => {
  try {
    const response = await axios.put(`${API_BASE}/admin/collectors/${collectorId}/reject`, {
      status: 'REJECTED',
      rejectionReason: reason,
      rejectedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error rejecting collector:', error)
    throw error
  }
}

// Activate collector account
export const activateCollector = async (collectorId) => {
  try {
    const response = await axios.put(`${API_BASE}/admin/collectors/${collectorId}/activate`, {
      isActive: true,
      activatedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error activating collector:', error)
    throw error
  }
}

// Deactivate collector account
export const deactivateCollector = async (collectorId, reason = '') => {
  try {
    const response = await axios.put(`${API_BASE}/admin/collectors/${collectorId}/deactivate`, {
      isActive: false,
      deactivationReason: reason,
      deactivatedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error deactivating collector:', error)
    throw error
  }
}

// Get all tasks (admin overview)
export const getAllTasks = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/tasks`, { params: filters })
    return response.data
  } catch (error) {
    console.error('Error fetching all tasks:', error)
    throw error
  }
}

// Get daily tasks
export const getDailyTasks = async (date = null) => {
  try {
    const params = date ? { date } : { date: new Date().toISOString().split('T')[0] }
    const response = await axios.get(`${API_BASE}/admin/tasks/daily`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching daily tasks:', error)
    throw error
  }
}

// Get collector performance metrics
export const getCollectorMetrics = async (collectorId) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/collectors/${collectorId}/metrics`)
    return response.data
  } catch (error) {
    console.error('Error fetching collector metrics:', error)
    throw error
  }
}

// Get system-wide statistics
export const getSystemStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/admin/statistics`)
    return response.data
  } catch (error) {
    console.error('Error fetching system statistics:', error)
    throw error
  }
}

// Generate system report
export const generateSystemReport = async (reportType, startDate, endDate) => {
  try {
    const response = await axios.post(`${API_BASE}/admin/reports/generate`, {
      reportType, // 'daily', 'weekly', 'monthly', 'custom'
      startDate,
      endDate,
      generatedAt: new Date(),
    })

    return response.data
  } catch (error) {
    console.error('Error generating system report:', error)
    throw error
  }
}

// Export report (PDF, Excel, etc.)
export const exportReport = async (reportId, format = 'pdf') => {
  try {
    const response = await axios.get(`${API_BASE}/admin/reports/${reportId}/export`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    })

    return response.data
  } catch (error) {
    console.error('Error exporting report:', error)
    throw error
  }
}

// Get environmental metrics (carbon savings, recycling rates, etc.)
export const getEnvironmentalMetrics = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/environmental-metrics`, {
      params: { startDate, endDate },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching environmental metrics:', error)
    throw error
  }
}

// Manage system settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await axios.put(`${API_BASE}/admin/settings`, settings)
    return response.data
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}
