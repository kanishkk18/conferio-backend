'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, Video, X } from 'lucide-react'
import { format } from 'date-fns'

export default function Meetings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('UPCOMING')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings', filter],
    queryFn: async () => {
      const response = await fetch(`/api/meeting/user/all?filter=${filter}`)
      if (!response.ok) throw new Error('Failed to fetch meetings')
      return response.json()
    },
    enabled: !!session,
  })

  const cancelMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meeting/cancel/${meetingId}`, {
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to cancel meeting')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
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
              <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
              <p className="text-gray-600">
                View and manage your scheduled meetings
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'UPCOMING' ? 'default' : 'outline'}
                onClick={() => setFilter('UPCOMING')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'PAST' ? 'default' : 'outline'}
                onClick={() => setFilter('PAST')}
              >
                Past
              </Button>
              <Button
                variant={filter === 'CANCELLED' ? 'default' : 'outline'}
                onClick={() => setFilter('CANCELLED')}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {meetings?.meetings?.length > 0 ? (
          <div className="grid gap-6">
            {meetings.meetings.map((meeting: any) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {meeting.event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {meeting.guestName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(meeting.startTime), 'PPP p')}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {meeting.meetLink && filter === 'UPCOMING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(meeting.meetLink, '_blank')}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join
                        </Button>
                      )}
                      {filter === 'UPCOMING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelMeetingMutation.mutate(meeting.id)}
                          disabled={cancelMeetingMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Guest Email:</strong> {meeting.guestEmail}
                    </p>
                    {meeting.additionalInfo && (
                      <p className="text-sm text-gray-600">
                        <strong>Additional Info:</strong> {meeting.additionalInfo}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Duration:</strong> {meeting.event.duration} minutes
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        meeting.status === 'SCHEDULED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No {filter.toLowerCase()} meetings
            </h2>
            <p className="text-gray-600">
              {filter === 'UPCOMING' 
                ? "You don't have any upcoming meetings scheduled."
                : `No ${filter.toLowerCase()} meetings found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}