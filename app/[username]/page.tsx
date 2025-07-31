'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function PublicProfile() {
  const params = useParams()
  const username = params.username as string

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-events', username],
    queryFn: async () => {
      const response = await fetch(`/api/event/public/${username}`)
      if (!response.ok) throw new Error('Failed to fetch public events')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !data?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist or has no public events.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            {data.user.imageUrl && (
              <img
                src={data.user.imageUrl}
                alt={data.user.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.user.name}
            </h1>
            <p className="text-gray-600">
              Book a meeting with me
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {data.events?.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Available Meeting Types
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.events.map((event: any) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.locationType.replace('_', ' ').toLowerCase()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.description && (
                      <p className="text-gray-600 mb-4 text-sm">
                        {event.description}
                      </p>
                    )}
                    <Link href={`/${username}/${event.slug}`}>
                      <Button className="w-full">
                        Book Meeting
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No public events available
            </h2>
            <p className="text-gray-600">
              This user hasn't created any public booking events yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}