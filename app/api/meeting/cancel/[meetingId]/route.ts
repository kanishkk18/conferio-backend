import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MeetingIdSchema } from '@/lib/validation'
import { withAuth, withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException, BadRequestException } from '@/lib/errors'
import { MeetingStatus, IntegrationAppType } from '@prisma/client'
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

const handler = withAuth(
  withValidation(
    MeetingIdSchema,
    async (req: NextRequest, data: any, userId: string) => {
      const meeting = await prisma.meeting.findFirst({
        where: { 
          id: data.meetingId,
          userId 
        },
        include: {
          event: {
            include: {
              user: true,
            },
          },
        },
      })

      if (!meeting) {
        throw new NotFoundException("Meeting not found")
      }

      try {
        const calendarIntegration = await prisma.integration.findFirst({
          where: {
            appType: meeting.calendarAppType as IntegrationAppType,
            userId: meeting.event.user.id,
          },
        })

        if (calendarIntegration) {
          const { calendar, calendarType } = await getCalendarClient(
            calendarIntegration.appType,
            calendarIntegration.accessToken,
            calendarIntegration.refreshToken,
            calendarIntegration.expiryDate
          )

          switch (calendarType) {
            case IntegrationAppType.GOOGLE_MEET_AND_CALENDAR:
              await calendar.events.delete({
                calendarId: "primary",
                eventId: meeting.calendarEventId,
              })
              break
            default:
              throw new BadRequestException(
                `Unsupported calendar provider: ${calendarType}`
              )
          }
        }
      } catch (error) {
        throw new BadRequestException("Failed to delete event from calendar")
      }

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: MeetingStatus.CANCELLED },
      })

      return NextResponse.json(
        {
          message: "Meeting cancelled successfully",
        },
        { status: HTTPSTATUS.OK }
      )
    }
  )
)

export const PUT = withErrorHandling((req: NextRequest, { params }: { params: { meetingId: string } }) => 
  handler(req, { meetingId: params.meetingId })
)