import { Client } from 'jac-client'

const JAC_CONFIG = {
  serverUrl: import.meta.env.VITE_JAC_SERVER_URL || 'http://localhost:8888',
  timeout: 10000,
  retries: 3
}

class JacService {
  constructor() {
    this.client = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    try {
      this.client = new Client(JAC_CONFIG)
      await this.client.connect()
      this.initialized = true
      console.log('Jac client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Jac client:', error)
      throw error
    }
  }

  async spawnWalker(walkerName, ctx = {}) {
    if (!this.initialized) await this.init()

    try {
      const result = await this.client.spawn(walkerName, ctx)
      return result
    } catch (error) {
      console.error(`Failed to spawn walker ${walkerName}:`, error)
      throw error
    }
  }

  async createNode(nodeType, data) {
    if (!this.initialized) await this.init()

    try {
      const result = await this.client.create_node(nodeType, data)
      return result
    } catch (error) {
      console.error(`Failed to create ${nodeType} node:`, error)
      throw error
    }
  }

  async runWalker(walkerName, nodeId, ctx = {}) {
    if (!this.initialized) await this.init()

    try {
      const result = await this.client.run(walkerName, nodeId, ctx)
      return result
    } catch (error) {
      console.error(`Failed to run walker ${walkerName} on node ${nodeId}:`, error)
      throw error
    }
  }

  async queryGraph(query, variables = {}) {
    if (!this.initialized) await this.init()

    try {
      const result = await this.client.query(query, variables)
      return result
    } catch (error) {
      console.error('Graph query failed:', error)
      throw error
    }
  }
}

export default new JacService()