import { createContext, useContext, useState, useEffect } from 'react'
import { useJac } from './JacContext.jsx'
import toast from 'react-hot-toast'

const WasteLinkContext = createContext({})

export const useWasteLink = () => useContext(WasteLinkContext)

export const WasteLinkProvider = ({ children }) => {
  const { spawnWalker, createNode, runWalker } = useJac()
  const [wasteRequests, setWasteRequests] = useState([])
  const [collectorTasks, setCollectorTasks] = useState([])
  const [systemMetrics, setSystemMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    if (wasteRequests.length === 0) {
      loadWasteRequests()
    }
    if (!systemMetrics) {
      loadSystemMetrics()
    }
  }, [])

  const loadWasteRequests = async () => {
    try {
      setLoading(true)
      const result = await spawnWalker('get_waste_requests')
      setWasteRequests(result.requests || [])
    } catch (error) {
      console.error('Failed to load waste requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCollectorTasks = async (collectorId) => {
    try {
      setLoading(true)
      const result = await spawnWalker('get_collector_tasks', { collectorId })
      setCollectorTasks(result.tasks || [])
    } catch (error) {
      console.error('Failed to load collector tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSystemMetrics = async () => {
    try {
      setLoading(true)
      const result = await spawnWalker('get_system_metrics')
      setSystemMetrics(result)
    } catch (error) {
      console.error('Failed to load system metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const createWasteRequest = async (requestData) => {
    try {
      setLoading(true)
      const result = await spawnWalker('create_waste_request', requestData)
      
      // Create waste request node
      const node = await createNode('waste_request', {
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      // Update local state
      setWasteRequests(prev => [node, ...prev])
      
      toast.success('Waste pickup requested successfully!')
      return node
    } catch (error) {
      toast.error('Failed to create waste request')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId, status) => {
    try {
      setLoading(true)
      const result = await spawnWalker('update_request_status', { requestId, status })
      
      // Update local state
      setWasteRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status } : req
        )
      )

      toast.success(`Request ${status} successfully`)
      return result
    } catch (error) {
      toast.error(`Failed to update request status: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const assignTaskToCollector = async (taskId, collectorId) => {
    try {
      setLoading(true)
      // Run walker to assign task
      const result = await runWalker('assign_collector', taskId, { collectorId })
      
      // Update local state
      setCollectorTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, collectorId, status: 'assigned' } : task
        )
      )

      toast.success('Task assigned to collector')
      return result
    } catch (error) {
      toast.error('Failed to assign task')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getAIRecommendations = async (context) => {
    try {
      setLoading(true)
      const result = await spawnWalker('get_ai_recommendations', context)
      return result.recommendations || []
    } catch (error) {
      console.error('Failed to get AI recommendations:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const value = {
    wasteRequests,
    collectorTasks,
    systemMetrics,
    loading,
    createWasteRequest,
    updateRequestStatus,
    assignTaskToCollector,
    loadWasteRequests,
    loadCollectorTasks,
    loadSystemMetrics,
    getAIRecommendations
  }

  return (
    <WasteLinkContext.Provider value={value}>
      {children}
    </WasteLinkContext.Provider>
  )
}