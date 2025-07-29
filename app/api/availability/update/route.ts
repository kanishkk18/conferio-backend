import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateAvailabilitySchema } from '@/lib/validation'
import { withAuth, withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException } from '@/lib/errors'
import { DayOfWeek } from '@prisma/client'

const handler = withAuth(
  withValidation(
    UpdateAvailabilitySchema,
    async (req: NextRequest, data: any, userId: string) => {
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

      if (!user) {
        throw new NotFoundException("User not found")
      }

      const dayAvailabilityData = data.days.map(({ day, isAvailable, startTime, endTime }: any) => {
        const baseDate = new Date().toISOString().split("T")[0]
        return {
          day: day.toUpperCase() as DayOfWeek,
          startTime: new Date(`${baseDate}T${startTime}:00Z`),
          endTime: new Date(`${baseDate}T${endTime}:00Z`),
          isAvailable,
        }
      })

      if (user.availability) {
        // Delete existing day availabilities
        await prisma.dayAvailability.deleteMany({
          where: { availabilityId: user.availability.id },
        })

        // Update availability with new data
        await prisma.availability.update({
          where: { id: user.availability.id },
          data: {
            timeGap: data.timeGap,
            days: {
              create: dayAvailabilityData,
            },
          },
        })
      }

      return NextResponse.json(
        {
          message: "Availability updated successfully",
        },
        { status: HTTPSTATUS.OK }
      )
    }
  )
)

export const PUT = withErrorHandling(handler)