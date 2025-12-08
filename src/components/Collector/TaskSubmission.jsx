import React, { useState, useEffect } from 'react'
import { MapPin, Weight, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { submitWasteDetails, completeTask, updateCollectorLocation } from '../../services/taskService'
import { classifyWaste } from '../../services/wasteClassificationService'
import toast from 'react-hot-toast'

export default function TaskSubmission({ task, collector }) {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [formData, setFormData] = useState({
    wasteWeight: '',
    wasteType: 'mixed',
    description: '',
  })
  const [classification, setClassification] = useState(null)
  const [classifying, setClassifying] = useState(false)

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClassifyImages = async () => {
    if (images.length === 0) {
      toast.error('Please select images first')
      return
    }

    setClassifying(true)
    try {
      const result = await classifyWaste(images[0])
      setClassification(result)
      setFormData((prev) => ({
        ...prev,
        wasteType: result.primaryCategory,
      }))
      toast.success('Waste classified successfully!')
    } catch (error) {
      toast.error('Failed to classify waste. Please classify manually.')
    } finally {
      setClassifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.wasteWeight || parseFloat(formData.wasteWeight) <= 0) {
        toast.error('Please enter valid waste weight')
        setLoading(false)
        return
      }

      if (images.length === 0) {
        toast.error('Please upload at least one image')
        setLoading(false)
        return
      }

      // Submit waste details
      await submitWasteDetails(task.id, {
        wasteWeight: parseFloat(formData.wasteWeight),
        wasteType: formData.wasteType,
        description: formData.description,
        images,
        classification,
      })

      // Complete task
      await completeTask(task.id, {
        collectorId: collector.id,
        wasteWeight: parseFloat(formData.wasteWeight),
        wasteType: formData.wasteType,
      })

      toast.success('Task completed successfully!')

      // Reset form
      setFormData({
        wasteWeight: '',
        wasteType: 'mixed',
        description: '',
      })
      setImages([])
      setImagePreviews([])
      setClassification(null)
    } catch (error) {
      toast.error(error.message || 'Failed to submit task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        <CheckCircle className="inline w-6 h-6 mr-2" />
        Complete Pickup Task
      </h2>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
        <p className="text-primary-800 font-semibold">
          📍 {task?.address || 'Loading address...'}
        </p>
        <p className="text-primary-700 text-sm mt-1">Waste Type: {task?.wasteType}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Images */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            <ImageIcon className="inline w-5 h-5 mr-2" />
            Upload Waste Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="block w-full text-gray-700 border-2 border-gray-300 rounded-xl p-3 focus:outline-none focus:border-primary-400"
          />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                />
              ))}
            </div>
          )}
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleClassifyImages}
              disabled={classifying}
              className="btn-accent mt-3 w-full"
            >
              {classifying ? 'Classifying...' : '🤖 Classify with AI'}
            </button>
          )}
          {classification && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✓ Detected: {classification.primaryCategory}
              </p>
              <p className="text-green-700 text-sm">
                Confidence: {(classification.confidence * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Waste Weight */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            <Weight className="inline w-5 h-5 mr-2" />
            Total Waste Weight
          </label>
          <div className="relative">
            <input
              type="number"
              name="wasteWeight"
              value={formData.wasteWeight}
              onChange={handleInputChange}
              placeholder="Enter weight in kg"
              step="0.1"
              min="0"
              className="input-field"
            />
            <span className="absolute right-4 top-3 text-gray-600 font-semibold">kg</span>
          </div>
        </div>

        {/* Waste Type */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">♻️ Waste Type</label>
          <select
            name="wasteType"
            value={formData.wasteType}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="metal">🔧 Metal</option>
            <option value="plastic">🧴 Plastic</option>
            <option value="paper">📄 Paper</option>
            <option value="glass">🍾 Glass</option>
            <option value="organic">🌿 Organic</option>
            <option value="electronic">📱 Electronic</option>
            <option value="hazardous">☣️ Hazardous</option>
            <option value="mixed">♻️ Mixed</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-3">📝 Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Any additional details about the waste?"
            rows="4"
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-success w-full"
        >
          {loading ? 'Submitting...' : '✓ Complete Task'}
        </button>
      </form>
    </div>
  )
}
