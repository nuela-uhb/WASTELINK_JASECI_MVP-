import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon, ChartBarIcon, HomeIcon, UsersIcon, TruckIcon, CogIcon } from '@heroicons/react/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import { Link, useLocation } from 'react-router-dom'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: `/${user?.role}/dashboard`, current: location.pathname.includes('dashboard'), icon: HomeIcon },
    { name: 'Analytics', href: `/${user?.role}/analytics`, current: location.pathname.includes('analytics'), icon: ChartBarIcon },
    { name: 'Community', href: `/${user?.role}/community`, current: location.pathname.includes('community'), icon: UsersIcon },
    { name: 'Collections', href: `/${user?.role}/collections`, current: location.pathname.includes('collections'), icon: TruckIcon },
    { name: 'Settings', href: `/${user?.role}/settings`, current: location.pathname.includes('settings'), icon: CogIcon },
  ]

  const userNavigation = [
    { name: 'Your Profile', href: `/${user?.role}/profile` },
    { name: 'Account Settings', href: `/${user?.role}/settings` },
    { name: 'Help Center', href: '#' },
    { name: 'Sign out', onClick: logout },
  ]

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-gradient-to-r from-cyan-500 to-blue-600';
      case 'collector': return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'resident': return 'bg-gradient-to-r from-emerald-500 to-green-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  }

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-white to-green-50 shadow-lg border-b border-green-100">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xl">WL</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                        WasteLink
                      </span>
                      <p className="text-xs text-gray-500 -mt-1">AI Waste Management</p>
                    </div>
                  </Link>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-primary-50 text-primary-700 border-primary-500'
                          : 'text-gray-700 hover:bg-green-50 hover:text-primary-600 border-transparent',
                        'group flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 border mx-1'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <item.icon className={classNames(
                        item.current ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500',
                        'mr-2 h-5 w-5'
                      )} />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Right side - User section */}
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    type="button"
                    className="p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </div>
                
                {/* Eco Score Badge */}
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">♻️</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Eco Score</div>
                    <div className="text-sm font-bold text-green-700">8.5/10</div>
                  </div>
                </div>
                
                {/* Separator */}
                <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 rounded-xl p-1 transition-all duration-200 hover:bg-green-50">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                      </div>
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-xl ${getRoleColor(user?.role)} flex items-center justify-center shadow-md`}>
                          <span className="text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${user?.role === 'admin' ? 'bg-cyan-600' : 
                                           user?.role === 'collector' ? 'bg-amber-600' : 
                                           'bg-emerald-600'}`}>
                            {user?.role?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-100 overflow-hidden">
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-green-50 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={`h-12 w-12 rounded-xl ${getRoleColor(user?.role)} flex items-center justify-center shadow`}>
                            <span className="text-white font-bold text-lg">
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-cyan-100 text-cyan-800' : 
                                               user?.role === 'collector' ? 'bg-amber-100 text-amber-800' : 
                                               'bg-emerald-100 text-emerald-800'}`}>
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">Member since 2024</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              item.onClick ? (
                                <button
                                  onClick={item.onClick}
                                  className={classNames(
                                    active ? 'bg-green-50' : '',
                                    'flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-primary-700 transition-colors duration-150'
                                  )}
                                >
                                  {item.name === 'Sign out' && (
                                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                  )}
                                  {item.name}
                                </button>
                              ) : (
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    active ? 'bg-green-50' : '',
                                    'flex items-center px-4 py-3 text-sm text-gray-700 hover:text-primary-700 transition-colors duration-150'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                      
                      {/* Footer */}
                      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Version 2.1.0</span>
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                            Online
                          </span>
                        </div>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
                
                {/* Mobile menu button */}
                <div className="lg:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <Disclosure.Panel className="lg:hidden border-t border-green-100 bg-gradient-to-b from-white to-green-50 shadow-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-primary-50 text-primary-700 border-primary-500'
                      : 'text-gray-700 hover:bg-green-50 hover:text-primary-600',
                    'group flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 border border-transparent hover:border-green-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <item.icon className={classNames(
                    item.current ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500',
                    'mr-3 h-6 w-6'
                  )} />
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            
            {/* Mobile user info */}
            <div className="pt-4 pb-3 border-t border-green-100">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-xl ${getRoleColor(user?.role)} flex items-center justify-center shadow`}>
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-bold text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-cyan-100 text-cyan-800' : 
                                     user?.role === 'collector' ? 'bg-amber-100 text-amber-800' : 
                                     'bg-emerald-100 text-emerald-800'}`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                    <div className="ml-2 flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      Active
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-auto flex-shrink-0 p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* Eco Score Mobile */}
              <div className="mt-4 mx-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-bold text-sm">♻️</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Your Eco Score</div>
                      <div className="text-lg font-bold text-green-700">8.5/10</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Top 15%</div>
                </div>
              </div>
              
              {/* Mobile user menu */}
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={item.onClick ? 'button' : Link}
                    onClick={item.onClick}
                    to={item.href}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-700 hover:bg-green-50 rounded-xl transition-colors duration-150"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}