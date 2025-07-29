import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventIdSchema } from '@/lib/validation'
import { withAuth, withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException } from '@/lib/errors'

const handler = withAuth(
  withValidation(
    EventIdSchema,
    async (req: NextRequest, data: any, userId: string) => {
      const event = await prisma.event.findFirst({
        where: { 
          id: data.eventId, 
          userId 
        },
      })

      if (!event) {
        throw new NotFoundException("Event not found")
      }

      const updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: { isPrivate: !event.isPrivate },
      })

      return NextResponse.json(
        {
          message: `Event set to ${updatedEvent.isPrivate ? "private" : "public"} successfully`,
        },
        { status: HTTPSTATUS.OK }
      )
    }
  )
)

export const PUT = withErrorHandling(handler)