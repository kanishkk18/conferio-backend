'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">Conferio</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The modern meeting scheduling platform that makes booking appointments effortless for you and your clients.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-600">Easy Scheduling</CardTitle>
              <CardDescription>
                Create events and let others book time with you seamlessly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set your availability, create event types, and share your booking link. 
                It's that simple.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-600">Calendar Integration</CardTitle>
              <CardDescription>
                Sync with Google Calendar and other popular calendar apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatic calendar syncing prevents double bookings and keeps 
                your schedule organized.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-600">Professional Experience</CardTitle>
              <CardDescription>
                Provide a smooth booking experience for your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Customizable booking pages, automated confirmations, and 
                professional meeting links.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}