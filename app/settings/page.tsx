'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Clock, Calendar } from 'lucide-react'

const DAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 
  'THURSDAY', 'FRIDAY', 'SATURDAY'
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [availability, setAvailability] = useState({
    timeGap: 30,
    days: DAYS.map(day => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: day !== 'SUNDAY' && day !== 'SATURDAY'
    }))
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ['availability'],
    queryFn: async () => {
      const response = await fetch('/api/availability/me')
      if (!response.ok) throw new Error('Failed to fetch availability')
      return response.json()
    },
    enabled: !!session,
  })

  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await fetch('/api/integration/all')
      if (!response.ok) throw new Error('Failed to fetch integrations')
      return response.json()
    },
    enabled: !!session,
  })

  useEffect(() => {
    if (availabilityData?.availability) {
      setAvailability(availabilityData.availability)
    }
  }, [availabilityData])

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: typeof availability) => {
      const response = await fetch('/api/availability/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update availability')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })

  const connectIntegrationMutation = useMutation({
    mutationFn: async (appType: string) => {
      const response = await fetch(`/api/integration/connect/${appType}`)
      if (!response.ok) throw new Error('Failed to get connection URL')
      const data = await response.json()
      window.location.href = data.url
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateAvailabilityMutation.mutate(availability)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Settings className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage your availability and integrations
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Availability Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability
              </CardTitle>
              <CardDescription>
                Set your working hours and time preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Gap Between Meetings (minutes)
                  </label>
                  <Input
                    type="number"
                    value={availability.timeGap}
                    onChange={(e) => setAvailability({
                      ...availability,
                      timeGap: parseInt(e.target.value)
                    })}
                    min="0"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Weekly Schedule</h3>
                  {availability.days.map((dayAvail, index) => (
                    <div key={dayAvail.day} className="flex items-center gap-4">
                      <div className="w-24">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dayAvail.isAvailable}
                            onChange={(e) => {
                              const newDays = [...availability.days]
                              newDays[index].isAvailable = e.target.checked
                              setAvailability({ ...availability, days: newDays })
                            }}
                            className="mr-2"
                          />
                          {dayAvail.day.charAt(0) + dayAvail.day.slice(1).toLowerCase()}
                        </label>
                      </div>
                      {dayAvail.isAvailable && (
                        <>
                          <Input
                            type="time"
                            value={dayAvail.startTime}
                            onChange={(e) => {
                              const newDays = [...availability.days]
                              newDays[index].startTime = e.target.value
                              setAvailability({ ...availability, days: newDays })
                            }}
                            className="w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={dayAvail.endTime}
                            onChange={(e) => {
                              const newDays = [...availability.days]
                              newDays[index].endTime = e.target.value
                              setAvailability({ ...availability, days: newDays })
                            }}
                            className="w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={updateAvailabilityMutation.isPending}
                  className="w-full"
                >
                  {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Integrations
              </CardTitle>
              <CardDescription>
                Connect your calendar and video conferencing apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations?.integrations?.map((integration: any) => (
                  <div key={integration.app_type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{integration.title}</h3>
                      <p className="text-sm text-gray-600">{integration.category}</p>
                    </div>
                    {integration.isConnected ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600">Connected</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => connectIntegrationMutation.mutate(integration.app_type)}
                        disabled={connectIntegrationMutation.isPending}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your public profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input value={session?.user?.name || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input value={session?.user?.email || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input value={session?.user?.username || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Booking Link
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    {window.location.origin}/
                  </span>
                  <Input 
                    value={session?.user?.username || ''} 
                    disabled 
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}