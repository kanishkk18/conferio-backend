import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandling } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException } from '@/lib/errors'

const handler = withAuth(async (req: NextRequest, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      availability: {
        include: {
          days: true,
        },
      },
    },
  })

  if (!user || !user.availability) {
    throw new NotFoundException("User not found or availability")
  }

  const availabilityData = {
    timeGap: user.availability.timeGap,
    days: user.availability.days.map((dayAvailability) => ({
      day: dayAvailability.day,
      startTime: dayAvailability.startTime.toISOString().slice(11, 16),
      endTime: dayAvailability.endTime.toISOString().slice(11, 16),
      isAvailable: dayAvailability.isAvailable,
    })),
  }

  return NextResponse.json(
    {
      message: "Fetched availability successfully",
      availability: availabilityData,
    },
    { status: HTTPSTATUS.OK }
  )
})

export const GET = withErrorHandling(handler)