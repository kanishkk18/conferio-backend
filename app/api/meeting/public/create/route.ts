import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateMeetingSchema } from '@/lib/validation'
import { withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException, BadRequestException } from '@/lib/errors'
import { EventLocationType, IntegrationAppType } from '@prisma/client'
import { googleOAuth2Client } from '@/lib/oauth'
import { google } from 'googleapis'

async function validateGoogleToken(
  accessToken: string,
  refreshToken: string | null,
  expiryDate: bigint | null
) {
  if (expiryDate === null || Date.now() >= Number(expiryDate)) {
    googleOAuth2Client.setCredentials({
      refresh_token: refreshToken,
    })
    const { credentials } = await googleOAuth2Client.refreshAccessToken()
    return credentials.access_token
  }

  return accessToken
}

async function getCalendarClient(
  appType: IntegrationAppType,
  accessToken: string,
  refreshToken: string | null,
  expiryDate: bigint | null
) {
  switch (appType) {
    case IntegrationAppType.GOOGLE_MEET_AND_CALENDAR:
      const validToken = await validateGoogleToken(
        accessToken,
        refreshToken,
        expiryDate
      )
      googleOAuth2Client.setCredentials({ access_token: validToken })
      const calendar = google.calendar({
        version: "v3",
        auth: googleOAuth2Client,
      })
      return {
        calendar,
        calendarType: IntegrationAppType.GOOGLE_MEET_AND_CALENDAR,
      }
    default:
      throw new BadRequestException(`Unsupported Calendar provider: ${appType}`)
  }
}

const handler = withValidation(
  CreateMeetingSchema,
  async (req: NextRequest, data: any) => {
    const { eventId, guestEmail, guestName, additionalInfo } = data
    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)

    const event = await prisma.event.findFirst({
      where: { 
        id: eventId, 
        isPrivate: false 
      },
      include: {
        user: true,
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (!Object.values(EventLocationType).includes(event.locationType)) {
      throw new BadRequestException("Invalid location type")
    }

    const meetIntegration = await prisma.integration.findFirst({
      where: {
        userId: event.user.id,
        appType: IntegrationAppType[event.locationType as keyof typeof IntegrationAppType],
      },
    })

    if (!meetIntegration) {
      throw new BadRequestException("No video conferencing integration found")
    }

    let meetLink: string = ""
    let calendarEventId: string = ""
    let calendarAppType: string = ""

    if (event.locationType === EventLocationType.GOOGLE_MEET_AND_CALENDAR) {
      const { calendarType, calendar } = await getCalendarClient(
        meetIntegration.appType,
        meetIntegration.accessToken,
        meetIntegration.refreshToken,
        meetIntegration.expiryDate
      )

      const response = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary: `${guestName} - ${event.title}`,
          description: additionalInfo,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          attendees: [{ email: guestEmail }, { email: event.user.email }],
          conferenceData: {
            createRequest: {
              requestId: `${event.id}-${Date.now()}`,
            },
          },
        },
      })

      meetLink = response.data.hangoutLink!
      calendarEventId = response.data.id!
      calendarAppType = calendarType
    }

    const meeting = await prisma.meeting.create({
      data: {
        eventId: event.id,
        userId: event.user.id,
        guestName,
        guestEmail,
        additionalInfo,
        startTime,
        endTime,
        meetLink,
        calendarEventId,
        calendarAppType,
      },
    })

    return NextResponse.json(
      {
        message: "Meeting scheduled successfully",
        data: {
          meetLink,
          meeting,
        },
      },
      { status: HTTPSTATUS.CREATED }
    )
  }
)

export const POST = withErrorHandling(handler)