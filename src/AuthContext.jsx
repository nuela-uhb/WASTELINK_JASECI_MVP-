import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('wastelink_token')
    const userData = localStorage.getItem('wastelink_user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Mock API call - replace with actual Jac implementation
      const mockUsers = {
        'resident@example.com': { 
          id: '1', 
          email, 
          role: 'resident', 
          name: 'John Doe',
          apartment: 'A101'
        },
        'collector@example.com': { 
          id: '2', 
          email, 
          role: 'collector', 
          name: 'Jane Smith',
          vehicle: 'Bike'
        },
        'admin@example.com': { 
          id: '3', 
          email, 
          role: 'admin', 
          name: 'Admin User'
        }
      }

      if (!mockUsers[email] || password !== 'password') {
        throw new Error('Invalid credentials')
      }

      const userData = mockUsers[email]
      const token = `mock-jwt-token-${userData.id}`

      localStorage.setItem('wastelink_token', token)
      localStorage.setItem('wastelink_user', JSON.stringify(userData))
      setUser(userData)

      toast.success(`Welcome back, ${userData.name}!`)
      
      // Redirect based on role
      switch(userData.role) {
        case 'resident':
          navigate('/resident/dashboard')
          break
        case 'collector':
          navigate('/collector/dashboard')
          break
        case 'admin':
          navigate('/admin/dashboard')
          break
      }
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      // Mock registration
      const token = `mock-jwt-token-${Date.now()}`
      const newUser = {
        id: Date.now().toString(),
        ...userData
      }

      localStorage.setItem('wastelink_token', token)
      localStorage.setItem('wastelink_user', JSON.stringify(newUser))
      setUser(newUser)

      toast.success('Registration successful!')
      navigate(`/${userData.role}/dashboard`)
    } catch (error) {
      toast.error('Registration failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('wastelink_token')
    localStorage.removeItem('wastelink_user')
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}