import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandling } from '@/lib/middleware'
import { googleOAuth2Client } from '@/lib/oauth'
import { decodeState } from '@/lib/utils'
import { config } from '@/lib/config'
import { BadRequestException } from '@/lib/errors'
import { IntegrationProvider, IntegrationCategory, IntegrationAppType } from '@prisma/client'

const CLIENT_APP_URL = config.FRONTEND_INTEGRATION_URL

const handler = async (req: NextRequest) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const CLIENT_URL = `${CLIENT_APP_URL}?app_type=google`

  if (!code || typeof code !== "string") {
    return NextResponse.redirect(`${CLIENT_URL}&error=Invalid authorization`)
  }

  if (!state || typeof state !== "string") {
    return NextResponse.redirect(`${CLIENT_URL}&error=Invalid state parameter`)
  }

  const { userId } = decodeState(state)

  if (!userId) {
    return NextResponse.redirect(`${CLIENT_URL}&error=UserId is required`)
  }

  const { tokens } = await googleOAuth2Client.getToken(code)

  if (!tokens.access_token) {
    return NextResponse.redirect(`${CLIENT_URL}&error=Access Token not passed`)
  }

  const existingIntegration = await prisma.integration.findFirst({
    where: {
      userId: userId,
      appType: IntegrationAppType.GOOGLE_MEET_AND_CALENDAR,
    },
  })

  if (existingIntegration) {
    throw new BadRequestException(`${IntegrationAppType.GOOGLE_MEET_AND_CALENDAR} already connected`)
  }

  await prisma.integration.create({
    data: {
      userId: userId,
      provider: IntegrationProvider.GOOGLE,
      category: IntegrationCategory.CALENDAR_AND_VIDEO_CONFERENCING,
      appType: IntegrationAppType.GOOGLE_MEET_AND_CALENDAR,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
      metadata: {
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    },
  })

  return NextResponse.redirect(`${CLIENT_URL}&success=true`)
}

export const GET = withErrorHandling(handler)