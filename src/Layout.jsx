import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>
      
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar Container */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        <div className="lg:hidden fixed inset-0 z-40" id="mobile-sidebar-overlay" style={{ display: 'none' }}>
          <div className="fixed inset-0 bg-black bg-opacity-50" id="mobile-sidebar-backdrop"></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out -translate-x-full" id="mobile-sidebar">
            <Sidebar />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header (if user is logged in) */}
            {user && (
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      Welcome back, {user.name || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {user.role === 'admin' ? 'Manage your waste management platform' : 
                       user.role === 'collector' ? 'Track your collection routes and schedules' : 
                       'Track your recycling and schedule pickups'}
                    </p>
                  </div>
                  
                  {/* User Status Badge */}
                  <div className="flex items-center gap-3">
                    <div className={`badge ${user.role === 'admin' ? 'badge-info' : 
                                     user.role === 'collector' ? 'badge-warning' : 
                                     'badge-success'}`}>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                    </div>
                    
                    {/* Mobile Menu Toggle Button */}
                    <button 
                      className="lg:hidden btn-secondary p-2 rounded-lg"
                      onClick={() => {
                        const overlay = document.getElementById('mobile-sidebar-overlay');
                        const sidebar = document.getElementById('mobile-sidebar');
                        if (overlay && sidebar) {
                          overlay.style.display = 'block';
                          setTimeout(() => {
                            sidebar.classList.remove('-translate-x-full');
                          }, 10);
                        }
                      }}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="stat-card">
                    <div className="stat-number text-primary-600">
                      {user.role === 'resident' ? '24' : user.role === 'collector' ? '18' : '156'}
                    </div>
                    <div className="stat-label">
                      {user.role === 'resident' ? 'Recycling Points' : 
                       user.role === 'collector' ? 'Collections Today' : 
                       'Active Users'}
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-number text-emerald-600">
                      {user.role === 'resident' ? '85%' : user.role === 'collector' ? '92%' : '99%'}
                    </div>
                    <div className="stat-label">
                      {user.role === 'resident' ? 'Recycling Rate' : 
                       user.role === 'collector' ? 'Route Efficiency' : 
                       'System Uptime'}
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-number text-cyan-600">
                      {user.role === 'resident' ? '12' : user.role === 'collector' ? '6' : '48'}
                    </div>
                    <div className="stat-label">
                      {user.role === 'resident' ? 'Eco Badges' : 
                       user.role === 'collector' ? 'Hours Worked' : 
                       'Connected Collectors'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content Outlet */}
            <div className="card p-4 md:p-6">
              <Outlet />
            </div>
            
            {/* Footer for logged in users */}
            {user && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-gray-600 text-sm">
                    <p>WasteLink AI Platform • {new Date().getFullYear()} • v2.1.0</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      System Status: <span className="font-medium text-green-600 ml-1">Operational</span>
                    </span>
                    <button className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors">
                      Need Help?
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Menu Close Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const overlay = document.getElementById('mobile-sidebar-overlay');
            const backdrop = document.getElementById('mobile-sidebar-backdrop');
            const sidebar = document.getElementById('mobile-sidebar');
            
            if (backdrop && overlay && sidebar) {
              backdrop.addEventListener('click', function() {
                sidebar.classList.add('-translate-x-full');
                setTimeout(() => {
                  overlay.style.display = 'none';
                }, 300);
              });
              
              // Close on escape key
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && overlay.style.display === 'block') {
                  sidebar.classList.add('-translate-x-full');
                  setTimeout(() => {
                    overlay.style.display = 'none';
                  }, 300);
                }
              });
            }
          });
        `
      }} />
    </div>
  )
}