'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Calendar, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'

export default function BookingPage() {
  const params = useParams()
  const username = params.username as string
  const slug = params.slug as string
  
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [step, setStep] = useState<'select-time' | 'book-meeting' | 'confirmed'>('select-time')
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    additionalInfo: '',
  })

  const { data: event, isLoading } = useQuery({
    queryKey: ['public-event', username, slug],
    queryFn: async () => {
      const response = await fetch(`/api/event/public/${username}/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch event')
      return response.json()
    },
  })

  const { data: availability } = useQuery({
    queryKey: ['availability', event?.event?.id],
    queryFn: async () => {
      const response = await fetch(`/api/availability/public/${event.event.id}`)
      if (!response.ok) throw new Error('Failed to fetch availability')
      return response.json()
    },
    enabled: !!event?.event?.id,
  })

  const bookMeetingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch('/api/meeting/public/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })
      if (!response.ok) throw new Error('Failed to book meeting')
      return response.json()
    },
    onSuccess: () => {
      setStep('confirmed')
    },
  })

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`)
    const endTime = new Date(startTime.getTime() + event.event.duration * 60000)
    
    bookMeetingMutation.mutate({
      eventId: event.event.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      additionalInfo: formData.additionalInfo,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!event?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
            <CardDescription>
              Your meeting has been successfully scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{event.event.title}</h3>
              <p className="text-sm text-gray-600">
                {format(new Date(`${selectedDate}T${selectedTime}`), 'PPP p')}
              </p>
              <p className="text-sm text-gray-600">
                Duration: {event.event.duration} minutes
              </p>
            </div>
            <p className="text-sm text-gray-600">
              A confirmation email with meeting details has been sent to {formData.guestEmail}
            </p>
            <Link href={`/${username}`}>
              <Button variant="outline" className="w-full">
                Back to Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/${username}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.event.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.event.duration} minutes
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.event.locationType.replace('_', ' ').toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {step === 'select-time' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Select a Date & Time</CardTitle>
                  <CardDescription>
                    Choose your preferred meeting time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simple date selection */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 14 }, (_, i) => {
                        const date = addDays(new Date(), i)
                        const dateStr = format(date, 'yyyy-MM-dd')
                        const dayAvailability = availability?.data?.find((d: any) => 
                          d.day === format(date, 'EEEE').toUpperCase()
                        )
                        
                        if (!dayAvailability?.isAvailable) return null
                        
                        return (
                          <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`p-2 text-sm rounded-md border ${
                              selectedDate === dateStr
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
                            }`}
                          >
                            <div className="text-xs">{format(date, 'EEE')}</div>
                            <div>{format(date, 'd')}</div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Time slots */}
                    {selectedDate && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Available Times</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {(() => {
                            const selectedDateObj = new Date(selectedDate)
                            const dayName = format(selectedDateObj, 'EEEE').toUpperCase()
                            const dayAvailability = availability?.data?.find((d: any) => d.day === dayName)
                            
                            if (!dayAvailability?.slots) return null
                            
                            return dayAvailability.slots.map((time: string) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-2 text-sm rounded-md border ${
                                  selectedTime === time
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
                                }`}
                              >
                                {time}
                              </button>
                            ))
                          })()}
                        </div>
                      </div>
                    )}

                    {selectedDate && selectedTime && (
                      <Button 
                        onClick={() => setStep('book-meeting')}
                        className="w-full"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {event.event.user.imageUrl && (
                        <img
                          src={event.event.user.imageUrl}
                          alt={event.event.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{event.event.user.name}</h3>
                        <p className="text-sm text-gray-600">{event.event.title}</p>
                      </div>
                    </div>
                    
                    {event.event.description && (
                      <p className="text-gray-600">{event.event.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.event.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.event.locationType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'book-meeting' && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Enter Your Details</CardTitle>
                <CardDescription>
                  Please provide your information to complete the booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
                  <p className="text-blue-800">
                    {format(new Date(`${selectedDate}T${selectedTime}`), 'PPP p')}
                  </p>
                  <p className="text-sm text-blue-700">
                    {event.event.title} • {event.event.duration} minutes
                  </p>
                </div>

                <form onSubmit={handleBookMeeting} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      placeholder="Any additional details or questions..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('select-time')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={bookMeetingMutation.isPending}
                      className="flex-1"
                    >
                      {bookMeetingMutation.isPending ? 'Booking...' : 'Book Meeting'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}