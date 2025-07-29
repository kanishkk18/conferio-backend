import { NextRequest, NextResponse } from 'next/server'
import { AppTypeSchema } from '@/lib/validation'
import { withAuth, withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { googleOAuth2Client } from '@/lib/oauth'
import { encodeState } from '@/lib/utils'
import { BadRequestException } from '@/lib/errors'
import { IntegrationAppType } from '@prisma/client'

const handler = withAuth(
  withValidation(
    AppTypeSchema,
    async (req: NextRequest, data: any, userId: string) => {
      const state = encodeState({ userId, appType: data.appType })

      let authUrl: string

      switch (data.appType) {
        case IntegrationAppType.GOOGLE_MEET_AND_CALENDAR:
          authUrl = googleOAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/calendar.events"],
            prompt: "consent",
            state,
          })
          break
        default:
          throw new BadRequestException("Unsupported app type")
      }

      return NextResponse.json(
        { url: authUrl },
        { status: HTTPSTATUS.OK }
      )
    }
  )
)

export const GET = withErrorHandling((req: NextRequest, { params }: { params: { appType: string } }) => 
  handler(req, { appType: params.appType })
)