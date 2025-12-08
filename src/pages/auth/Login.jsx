import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Mock login - determine role from email
    setTimeout(() => {
      setLoading(false)
      const email = form.email.toLowerCase()

      // Mock user data
      const userData = {
        email: form.email,
        role: email.includes('collector') ? 'collector' : email.includes('admin') ? 'admin' : 'resident',
      }

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      toast.success('Login successful!')

      // Redirect based on role
      if (userData.role === 'collector') {
        navigate('/collector/dashboard')
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/resident/dashboard')
      }
    }, 1000)
  }

  const handleDemoLogin = (role) => {
    const emails = {
      resident: 'resident@example.com',
      collector: 'collector@example.com',
      admin: 'admin@wastelink.com',
    }
    setForm({ email: emails[role], password: 'password123' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-green-100 sm:px-10">
          <div className="mb-8">
            <a
              href="/"
              className="text-primary-600 hover:text-primary-800 mb-4 inline-flex items-center transition-colors font-medium"
            >
              ← Back to Home
            </a>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your WasteLink account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => toast.error('Password reset feature coming soon!')}
                  className="font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 text-lg font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-6 text-center font-medium">Quick demo access:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { role: 'resident', label: 'Resident', color: 'from-emerald-500 to-green-600' },
                { role: 'collector', label: 'Collector', color: 'from-amber-500 to-orange-600' },
                { role: 'admin', label: 'Admin', color: 'from-cyan-500 to-blue-600' },
              ].map(({ role, label, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoLogin(role)}
                  className="btn-role flex flex-col items-center p-4 hover:shadow-lg"
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-3`}>
                    <span className="text-white text-xl">
                      {role === 'resident' ? '👤' : role === 'collector' ? '🚚' : '⚙️'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">{label}</span>
                  <span className="text-xs text-gray-500 mt-1">Auto-fill credentials</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
