import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'resident',
    apartment: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!')
      setLoading(false)
      return
    }

    // Mock registration
    setTimeout(() => {
      setLoading(false)
      const userData = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        apartment: form.apartment,
      }

      localStorage.setItem('user', JSON.stringify(userData))
      toast.success(`Account created for ${form.name}!`)

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
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
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join the WasteLink community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+254 7XX XXX XXX"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="resident">Resident (Request waste pickups)</option>
                <option value="collector">Collector (Collect waste)</option>
                <option value="admin">Admin (Manage system)</option>
              </select>
            </div>

            {form.role === 'resident' && (
              <div className="form-group">
                <label className="form-label">Apartment/Building</label>
                <input
                  type="text"
                  name="apartment"
                  value={form.apartment}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="A101 or Building Name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3 text-lg font-semibold" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
