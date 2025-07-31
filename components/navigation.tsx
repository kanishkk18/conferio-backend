'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Settings, 
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Meetings', href: '/meetings', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!session) return null

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Conferio</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              {session.user?.image && (
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={session.user.image}
                  alt=""
                />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {session.user?.name}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
          <h1 className="text-xl font-bold text-gray-900">Conferio</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                {session.user?.image && (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={session.user.image}
                    alt=""
                  />
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {session.user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {session.user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}