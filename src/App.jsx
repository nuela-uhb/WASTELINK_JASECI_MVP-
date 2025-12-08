import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ResidentDashboard from './pages/resident/Dashboard.jsx'
import CollectorDashboard from './pages/collector/Dashboard.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import './main.css'

// Home Page Component
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="text-center relative z-10">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-3xl font-bold">WL</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          WasteLink
        </h1>
        
        <div className="space-y-4 max-w-md mx-auto">
          <a 
            href="/login"
            className="block w-full btn-primary py-4 text-lg font-semibold text-center"
          >
            Login to Dashboard
          </a>
          <a 
            href="/register"
            className="block w-full btn-secondary py-4 text-lg font-semibold text-center"
          >
            Create New Account
          </a>
        </div>

        <div className="mt-12 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Residents</h3>
              <p className="text-sm text-gray-600">Request pickups & track collectors</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Collectors</h3>
              <p className="text-sm text-gray-600">Get tasks & submit waste data</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Admins</h3>
              <p className="text-sm text-gray-600">Manage system & track impact</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component with Router
function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Resident Routes */}
        <Route path="/resident/dashboard" element={<ResidentDashboard />} />

        {/* Collector Routes */}
        <Route path="/collector/dashboard" element={<CollectorDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export default App