import jac from '../jac/core.js'

class AIService {
  async classifyWaste(imageData) {
    try {
      const result = await jac.spawnWalker('classify_waste', { image: imageData })
      return result
    } catch (error) {
      console.error('Failed to classify waste:', error)
      throw error
    }
  }

  async estimateVolume(wasteType, dimensions) {
    try {
      const result = await jac.spawnWalker('estimate_volume', {
        wasteType,
        dimensions,
        timestamp: new Date().toISOString()
      })
      return result
    } catch (error) {
      console.error('Failed to estimate volume:', error)
      throw error
    }
  }

  async optimizeSchedule(requests) {
    try {
      const result = await jac.spawnWalker('optimize_schedule', { requests })
      return result.schedule || []
    } catch (error) {
      console.error('Failed to optimize schedule:', error)
      throw error
    }
  }

  async predictCollectionTime(location, volume, wasteType) {
    try {
      const result = await jac.spawnWalker('predict_collection_time', {
        location,
        volume,
        wasteType
      })
      return result
    } catch (error) {
      console.error('Failed to predict collection time:', error)
      throw error
    }
  }
}

export default new AIService()