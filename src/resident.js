import jac from '../jac/core.js'

class ResidentService {
  async createWasteRequest(requestData) {
    try {
      const result = await jac.spawnWalker('create_waste_request', {
        ...requestData,
        timestamp: new Date().toISOString()
      })
      
      // Create node for the request
      const node = await jac.createNode('waste_request', {
        ...result,
        status: 'pending'
      })

      return node
    } catch (error) {
      console.error('Failed to create waste request:', error)
      throw error
    }
  }

  async getWasteRequests(residentId) {
    try {
      const result = await jac.spawnWalker('get_resident_requests', { residentId })
      return result.requests || []
    } catch (error) {
      console.error('Failed to get waste requests:', error)
      throw error
    }
  }

  async cancelRequest(requestId) {
    try {
      const result = await jac.spawnWalker('cancel_waste_request', { requestId })
      return result
    } catch (error) {
      console.error('Failed to cancel request:', error)
      throw error
    }
  }

  async getAIRecommendations(residentId) {
    try {
      const result = await jac.spawnWalker('get_resident_recommendations', { residentId })
      return result.recommendations || []
    } catch (error) {
      console.error('Failed to get AI recommendations:', error)
      return []
    }
  }
}

export default new ResidentService()