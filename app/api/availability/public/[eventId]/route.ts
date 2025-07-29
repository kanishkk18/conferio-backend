import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventIdSchema } from '@/lib/validation'
import { withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { DayOfWeek } from '@prisma/client'
import { addDays, addMinutes, format, parseISO } from 'date-fns'

type AvailableDay = {
  day: DayOfWeek
  slots: string[]
  isAvailable: boolean
}

function getNextDateForDay(dayOfWeek: string): Date {
  const days = [
    "SUNDAY",
    "MONDAY", 
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]

  const today = new Date()
  const todayDay = today.getDay()
  const targetDay = days.indexOf(dayOfWeek)
  const daysUntilTarget = (targetDay - todayDay + 7) % 7

  return addDays(today, daysUntilTarget)
}

function generateAvailableTimeSlots(
  startTime: Date,
  endTime: Date,
  duration: number,
  meetings: { startTime: Date; endTime: Date }[],
  dateStr: string,
  timeGap: number = 30
): string[] {
  const slots: string[] = []

  let slotStartTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  )

  let slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
  )

  const now = new Date()
  const isToday = format(now, "yyyy-MM-dd") === dateStr

  while (slotStartTime < slotEndTime) {
    if (!isToday || slotStartTime >= now) {
      const slotEnd = new Date(slotStartTime.getTime() + duration * 60000)

      if (isSlotAvailable(slotStartTime, slotEnd, meetings)) {
        slots.push(format(slotStartTime, "HH:mm"))
      }
    }

    slotStartTime = addMinutes(slotStartTime, timeGap)
  }

  return slots
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  meetings: { startTime: Date; endTime: Date }[]
): boolean {
  for (const meeting of meetings) {
    if (slotStart < meeting.endTime && slotEnd > meeting.startTime) {
      return false
    }
  }
  return true
}

const handler = withValidation(
  EventIdSchema,
  async (req: NextRequest, data: any) => {
    const event = await prisma.event.findFirst({
      where: { 
        id: data.eventId, 
        isPrivate: false 
      },
      include: {
        user: {
          include: {
            availability: {
              include: {
                days: true,
              },
            },
            meetings: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    })

    if (!event || !event.user.availability) {
      return NextResponse.json(
        {
          message: "Event availability fetched successfully",
          data: [],
        },
        { status: HTTPSTATUS.OK }
      )
    }

    const { availability, meetings } = event.user
    const daysOfWeek = Object.values(DayOfWeek)
    const availableDays: AvailableDay[] = []

    for (const dayOfWeek of daysOfWeek) {
      const nextDate = getNextDateForDay(dayOfWeek)
      const dayAvailability = availability.days.find((d) => d.day === dayOfWeek)

      if (dayAvailability) {
        const slots: string[] = dayAvailability.isAvailable
          ? generateAvailableTimeSlots(
              dayAvailability.startTime,
              dayAvailability.endTime,
              event.duration,
              meetings,
              format(nextDate, "yyyy-MM-dd"),
              availability.timeGap
            )
          : []

        availableDays.push({
          day: dayOfWeek,
          slots,
          isAvailable: dayAvailability.isAvailable,
        })
      }
    }

    return NextResponse.json(
      {
        message: "Event availability fetched successfully",
        data: availableDays,
      },
      { status: HTTPSTATUS.OK }
    )
  }
)

export const GET = withErrorHandling((req: NextRequest, { params }: { params: { eventId: string } }) => 
  handler(req, { eventId: params.eventId })
)