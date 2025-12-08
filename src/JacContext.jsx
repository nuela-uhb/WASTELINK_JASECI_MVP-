import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

// Mock Jac Client - Replace with actual jac-client implementation
const mockJacClient = {
  init: async (config) => {
    console.log('Jac Client initialized', config)
    return { success: true }
  },
  
  spawnWalker: async (name, ctx = {}) => {
    console.log(`Spawning walker: ${name}`, ctx)
    
    // Mock walker responses based on walker name
    const walkerResponses = {
      'get_waste_requests': {
        requests: [
          {
            id: '1',
            residentId: '1',
            wasteType: 'plastic',
            volume: 'medium',
            status: 'pending',
            createdAt: new Date().toISOString(),
            location: { lat: -1.2921, lng: 36.8219 }
          },
          {
            id: '2',
            residentId: '2',
            wasteType: 'organic',
            volume: 'small',
            status: 'assigned',
            createdAt: new Date().toISOString(),
            location: { lat: -1.2922, lng: 36.8220 }
          }
        ]
      },
      'get_collector_tasks': {
        tasks: [
          {
            id: '1',
            requestId: '1',
            status: 'assigned',
            estimatedTime: '30 mins',
            route: [
              { lat: -1.2921, lng: 36.8219 },
              { lat: -1.2922, lng: 36.8220 }
            ]
          }
        ]
      },
      'create_waste_request': (ctx) => ({
        requestId: `req_${Date.now()}`,
        ...ctx,
        status: 'pending',
        createdAt: new Date().toISOString()
      }),
      'update_request_status': (ctx) => ({
        success: true,
        ...ctx
      }),
      'get_system_metrics': {
        totalRequests: 150,
        completedRequests: 120,
        activeCollectors: 15,
        recyclingRate: '75%',
        monthlyGrowth: '+12%'
      }
    }

    const response = typeof walkerResponses[name] === 'function' 
      ? walkerResponses[name](ctx)
      : walkerResponses[name]

    return new Promise(resolve => {
      setTimeout(() => resolve(response), 500)
    })
  },

  createNode: async (nodeType, data) => {
    console.log(`Creating ${nodeType} node:`, data)
    return { 
      id: `node_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    }
  },

  runWalker: async (walkerName, nodeId, ctx = {}) => {
    console.log(`Running walker ${walkerName} on node ${nodeId}:`, ctx)
    return await mockJacClient.spawnWalker(walkerName, { nodeId, ...ctx })
  }
}

const JacContext = createContext({})

export const useJac = () => useContext(JacContext)

export const JacProvider = ({ children }) => {
  const [client, setClient] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeJac()
  }, [])

  const initializeJac = async () => {
    try {
      setLoading(true)
      // Initialize with mock client - replace with actual jac-client
      await mockJacClient.init({
        serverUrl: import.meta.env.VITE_JAC_SERVER_URL || 'http://localhost:8888',
        timeout: 10000
      })
      setClient(mockJacClient)
      setInitialized(true)
      toast.success('Jac system initialized')
    } catch (error) {
      console.error('Jac initialization failed:', error)
      toast.error('Failed to initialize Jac system')
    } finally {
      setLoading(false)
    }
  }

  const spawnWalker = async (name, ctx = {}) => {
    if (!client) throw new Error('Jac client not initialized')
    
    try {
      setLoading(true)
      const result = await client.spawnWalker(name, ctx)
      return result
    } catch (error) {
      toast.error(`Walker ${name} failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createNode = async (nodeType, data) => {
    if (!client) throw new Error('Jac client not initialized')
    
    try {
      setLoading(true)
      const result = await client.createNode(nodeType, data)
      toast.success(`${nodeType} created successfully`)
      return result
    } catch (error) {
      toast.error(`Failed to create ${nodeType}: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const runWalker = async (walkerName, nodeId, ctx = {}) => {
    if (!client) throw new Error('Jac client not initialized')
    
    try {
      setLoading(true)
      const result = await client.runWalker(walkerName, nodeId, ctx)
      return result
    } catch (error) {
      toast.error(`Walker ${walkerName} failed on node ${nodeId}: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    client,
    initialized,
    loading,
    spawnWalker,
    createNode,
    runWalker
  }

  return (
    <JacContext.Provider value={value}>
      {children}
    </JacContext.Provider>
  )
}