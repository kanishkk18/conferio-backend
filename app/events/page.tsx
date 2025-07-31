'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export default function Events() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

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

  const togglePrivacyMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch('/api/event/toggle-privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      if (!response.ok) throw new Error('Failed to toggle privacy')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/event/${eventId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete event')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
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
              <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
              <p className="text-gray-600">
                Create and manage your event types
              </p>
            </div>
            <Link href="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event Type
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {events?.data?.events?.length > 0 ? (
          <div className="grid gap-6">
            {events.data.events.map((event: any) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {event.title}
                        {event.isPrivate ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {event.duration} minutes • {event._count.meetings} bookings
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePrivacyMutation.mutate(event.id)}
                        disabled={togglePrivacyMutation.isPending}
                      >
                        {event.isPrivate ? 'Make Public' : 'Make Private'}
                      </Button>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEventMutation.mutate(event.id)}
                        disabled={deleteEventMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  {!event.isPrivate && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600 mb-1">Public booking link:</p>
                      <code className="text-sm text-blue-600">
                        {window.location.origin}/{events.data.username}/{event.slug}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No event types yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first event type to start accepting bookings
            </p>
            <Link href="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event Type
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}