// AI Waste Classification Service
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Classify waste from image using AI
export const classifyWaste = async (imageFile) => {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await axios.post(`${API_BASE}/ai/classify-waste`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error classifying waste:', error)
    throw error
  }
}

// Analyze multiple waste images and return detailed classification
export const analyzeWasteImages = async (imageFiles) => {
  try {
    const formData = new FormData()
    imageFiles.forEach((file) => {
      formData.append('images', file)
    })

    const response = await axios.post(`${API_BASE}/ai/analyze-waste`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error analyzing waste:', error)
    throw error
  }
}

// Estimate waste volume from images
export const estimateWasteVolume = async (imageFiles, dimensions = null) => {
  try {
    const formData = new FormData()
    imageFiles.forEach((file) => {
      formData.append('images', file)
    })

    if (dimensions) {
      formData.append('dimensions', JSON.stringify(dimensions))
    }

    const response = await axios.post(`${API_BASE}/ai/estimate-volume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error estimating volume:', error)
    throw error
  }
}

// Get waste classification categories
export const getWasteCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE}/ai/waste-categories`)
    return response.data
  } catch (error) {
    console.error('Error fetching waste categories:', error)
    // Return default categories as fallback
    return {
      categories: [
        { id: 'metal', label: 'Metal', color: '#8B8B8B', icon: '🔧' },
        { id: 'plastic', label: 'Plastic', color: '#FF6B6B', icon: '🧴' },
        { id: 'paper', label: 'Paper', color: '#FFD93D', icon: '📄' },
        { id: 'glass', label: 'Glass', color: '#A8D8EA', icon: '🍾' },
        { id: 'organic', label: 'Organic', color: '#90EE90', icon: '🌿' },
        { id: 'electronic', label: 'Electronic', color: '#9B59B6', icon: '📱' },
        { id: 'hazardous', label: 'Hazardous', color: '#FF4500', icon: '☣️' },
        { id: 'other', label: 'Other', color: '#CCCCCC', icon: '❓' },
      ],
    }
  }
}
