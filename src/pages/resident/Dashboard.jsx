import React, { useState } from 'react'
import { MapPin, Package, BarChart3 } from 'lucide-react'
import RequestPickup from '../../components/Resident/RequestPickup'

export default function ResidentDashboard() {
  const [activeTab, setActiveTab] = useState('request')
  
  // Mock resident data - replace with context/auth
  const resident = {
    id: 'resident_1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0100',
    apartment: 'A101',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome, {resident.name}!</h1>
          <p className="text-primary-100">Manage your waste pickup requests</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'request'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="inline w-5 h-5 mr-2" />
            Request Pickup
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'track'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="inline w-5 h-5 mr-2" />
            Track Collector
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Request History
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'request' && (
            <div>
              <RequestPickup resident={resident} />
            </div>
          )}

          {activeTab === 'track' && (
            <div className="card p-8">
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Live Tracking</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Once a collector accepts your request, you'll be able to track their location in real-time on the map.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card p-8">
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Request History</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You haven't made any requests yet. Create your first pickup request to see it here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
