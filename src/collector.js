import jac from '../jac/core.js'

class CollectorService {
  async getAssignedTasks(collectorId) {
    try {
      const result = await jac.spawnWalker('get_collector_tasks', { collectorId })
      return result.tasks || []
    } catch (error) {
      console.error('Failed to get collector tasks:', error)
      throw error
    }
  }

  async updateTaskStatus(taskId, status, data = {}) {
    try {
      const result = await jac.spawnWalker('update_task_status', {
        taskId,
        status,
        ...data,
        timestamp: new Date().toISOString()
      })
      return result
    } catch (error) {
      console.error('Failed to update task status:', error)
      throw error
    }
  }

  async getOptimizedRoute(tasks) {
    try {
      const result = await jac.spawnWalker('optimize_collection_route', { tasks })
      return result.route || []
    } catch (error) {
      console.error('Failed to get optimized route:', error)
      throw error
    }
  }

  async logCollectionData(collectionData) {
    try {
      const result = await jac.createNode('collection_log', {
        ...collectionData,
        timestamp: new Date().toISOString()
      })
      return result
    } catch (error) {
      console.error('Failed to log collection data:', error)
      throw error
    }
  }
}

export default new CollectorService()