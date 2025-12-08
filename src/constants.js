export const WASTE_TYPES = {
  ORGANIC: 'organic',
  PLASTIC: 'plastic',
  METAL: 'metal',
  GLASS: 'glass',
  MIXED: 'mixed',
  EWASTE: 'ewaste',
  PAPER: 'paper'
}

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const COLLECTOR_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
  ON_BREAK: 'on_break'
}

export const USER_ROLES = {
  RESIDENT: 'resident',
  COLLECTOR: 'collector',
  ADMIN: 'admin'
}

export const AI_CLASSIFICATION_CONFIDENCE = 0.85
export const DEFAULT_PICKUP_RADIUS_KM = 5
export const MAX_REQUEST_VOLUME_KG = 50

export const PRICING = {
  ORGANIC: 50,
  PLASTIC: 100,
  METAL: 150,
  GLASS: 120,
  MIXED: 80,
  MINIMUM_FEE: 200
}

export const API_ENDPOINTS = {
  JAC_SERVER: import.meta.env.VITE_JAC_SERVER_URL || 'http://localhost:8888',
  BACKEND_API: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
}