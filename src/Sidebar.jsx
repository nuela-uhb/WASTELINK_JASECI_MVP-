import { useAuth } from '../../context/AuthContext.jsx'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  ClockIcon,
  MapIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  TrashIcon,
  TruckIcon
} from '@heroicons/react/outline'

const residentNavigation = [
  { name: 'Dashboard', href: '/resident/dashboard', icon: HomeIcon },
  { name: 'Request Pickup', href: '/resident/request', icon: TrashIcon },
  { name: 'History', href: '/resident/history', icon: ClockIcon },
  { name: 'Settings', href: '/resident/settings', icon: CogIcon },
]

const collectorNavigation = [
  { name: 'Dashboard', href: '/collector/dashboard', icon: HomeIcon },
  { name: 'Active Tasks', href: '/collector/tasks', icon: TruckIcon },
  { name: 'Route Map', href: '/collector/route', icon: MapIcon },
  { name: 'Performance', href: '/collector/performance', icon: ChartBarIcon },
  { name: 'Settings', href: '/collector/settings', icon: CogIcon },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Metrics', href: '/admin/metrics', icon: ChartBarIcon },
  { name: 'Requests', href: '/admin/requests', icon: TrashIcon },
  { name: 'Collectors', href: '/admin/collectors', icon: TruckIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
]

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const getNavigation = () => {
    switch(user?.role) {
      case 'resident':
        return residentNavigation
      case 'collector':
        return collectorNavigation
      case 'admin':
        return adminNavigation
      default:
        return []
    }
  }

  const navigation = getNavigation()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const current = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${current
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}