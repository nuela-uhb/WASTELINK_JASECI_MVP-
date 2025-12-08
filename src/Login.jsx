import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { WasteIcon, Leaf, Shield, Users, Truck, Home, Building, Phone, Mail, User, Lock, Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountType: 'resident',
    apartment: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleAccountTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      accountType: type
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Valid email is required'
    }
    
    if (!formData.phone.match(/^\+254[0-9]{9}$/)) {
      newErrors.phone = 'Valid Kenyan phone number required (e.g., +254712345678)'
    }
    
    if (!formData.apartment.trim()) {
      newErrors.apartment = 'Apartment/building is required'
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      await signup(formData)
      navigate('/dashboard')
    } catch (error) {
      console.error('Signup failed:', error)
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Signup failed. Please try again.'
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignup = () => {
    setFormData({
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      accountType: 'resident',
      apartment: 'A101',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg mb-4">
            <WasteIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
            WasteLink
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Join our sustainable community
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-green-100 sm:px-10">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
            <p className="text-gray-600 mt-2">Start managing waste efficiently today</p>
          </div>

          {errors.submit && (
            <div className="alert-error mb-6">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {errors.submit}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary-600" />
                  Full Name
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.fullName ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label htmlFor="email" className="form-label flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary-600" />
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary-600" />
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="+254712345678"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Apartment/Building */}
              <div className="form-group">
                <label htmlFor="apartment" className="form-label flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary-600" />
                  Apartment/Building
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="apartment"
                    name="apartment"
                    type="text"
                    required
                    value={formData.apartment}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.apartment ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="A101 or Building Name"
                  />
                </div>
                {errors.apartment && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {errors.apartment}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary-600" />
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with numbers and symbols
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary-600" />
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Account Type Selection */}
            <div className="form-group">
              <label className="form-label flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary-600" />
                Account Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  { type: 'resident', icon: Home, label: 'Resident', desc: 'Request waste pickups', color: 'from-emerald-500 to-green-600' },
                  { type: 'collector', icon: Truck, label: 'Collector', desc: 'Service provider', color: 'from-amber-500 to-orange-600' },
                ].map(({ type, icon: Icon, label, desc, color }) => (
                  <div
                    key={type}
                    onClick={() => handleAccountTypeSelect(type)}
                    className={`btn-role flex items-center p-4 cursor-pointer transition-all duration-300 ${
                      formData.accountType === type ? 'active border-primary-500 bg-primary-50 ring-2 ring-primary-200' : ''
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-800 block">{label}</span>
                      <span className="text-sm text-gray-500">{desc}</span>
                    </div>
                    {formData.accountType === type && (
                      <div className="ml-auto">
                        <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="form-group">
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-800 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-800 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>

              {/* Demo Signup Button */}
              <button
                type="button"
                onClick={handleDemoSignup}
                className="w-full btn-accent py-3 text-lg font-semibold"
              >
                <span className="flex items-center justify-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Try Demo Account
                </span>
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Already have an account?</p>
              <Link
                to="/login"
                className="w-full btn-secondary py-3 text-lg font-semibold"
              >
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Zero Waste Goal', desc: 'Help achieve community recycling targets', icon: Leaf },
            { title: 'Secure Platform', desc: 'Your data is protected and private', icon: Shield },
            { title: 'Smart Scheduling', desc: 'AI-powered optimal pickup times', icon: Truck },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h4>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}