import { format } from 'date-fns'

export function formatDate(date) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

export function formatWeight(kg) {
  if (kg < 1) {
    return `${Math.round(kg * 1000)}g`
  }
  return `${kg.toFixed(1)}kg`
}

export function getStatusColor(status) {
  const colors = {
    pending: 'yellow',
    assigned: 'blue',
    in_progress: 'purple',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

export function getWasteTypeColor(type) {
  const colors = {
    organic: 'green',
    plastic: 'blue',
    metal: 'yellow',
    glass: 'purple',
    mixed: 'gray',
    ewaste: 'orange',
    paper: 'brown'
  }
  return colors[type] || 'gray'
}