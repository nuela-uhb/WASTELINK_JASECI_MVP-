import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import jac from '../services/jac/core.js'

export function useJac() {
  const [loading, setLoading] = useState(false)

  const spawnWalker = useCallback(async (walkerName, ctx = {}) => {
    setLoading(true)
    try {
      const result = await jac.spawnWalker(walkerName, ctx)
      return result
    } catch (error) {
      toast.error(`Walker ${walkerName} failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createNode = useCallback(async (nodeType, data) => {
    setLoading(true)
    try {
      const result = await jac.createNode(nodeType, data)
      toast.success(`${nodeType} created successfully`)
      return result
    } catch (error) {
      toast.error(`Failed to create ${nodeType}: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const queryGraph = useCallback(async (query, variables = {}) => {
    setLoading(true)
    try {
      const result = await jac.queryGraph(query, variables)
      return result
    } catch (error) {
      toast.error(`Query failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    spawnWalker,
    createNode,
    queryGraph
  }
}