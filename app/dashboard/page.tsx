'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Calendar, Users, Settings } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/event/all')
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json()
    },
    enabled: !!session,
  })

  const { data: meetings } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await fetch('/api/meeting/user/all')
      if (!response.ok) throw new Error('Failed to fetch meetings')
      return response.json()
    },
    enabled: !!session,
  })

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session?.user?.name}!
              </h1>
              <p className="text-gray-600">
                Manage your events and meetings
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/events/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events?.data?.events?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {meetings?.meetings?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Link</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-600">
                /{session?.user?.username || 'username'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Your latest event types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events?.data?.events?.length > 0 ? (
                <div className="space-y-4">
                  {events.data.events.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.duration} minutes</p>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No events yet</p>
                  <Link href="/events/create">
                    <Button>Create your first event</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>
                Your scheduled meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meetings?.meetings?.length > 0 ? (
                <div className="space-y-4">
                  {meetings.meetings.slice(0, 5).map((meeting: any) => (
                    <div key={meeting.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{meeting.event.title}</h3>
                        <p className="text-sm text-gray-600">
                          with {meeting.guestName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(meeting.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No upcoming meetings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}