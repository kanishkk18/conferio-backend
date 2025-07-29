import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandling } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { IntegrationAppType, IntegrationProvider, IntegrationCategory } from '@prisma/client'

const appTypeToProviderMap: Record<IntegrationAppType, IntegrationProvider> = {
  [IntegrationAppType.GOOGLE_MEET_AND_CALENDAR]: IntegrationProvider.GOOGLE,
  [IntegrationAppType.ZOOM_MEETING]: IntegrationProvider.ZOOM,
  [IntegrationAppType.OUTLOOK_CALENDAR]: IntegrationProvider.MICROSOFT,
}

const appTypeToCategoryMap: Record<IntegrationAppType, IntegrationCategory> = {
  [IntegrationAppType.GOOGLE_MEET_AND_CALENDAR]: IntegrationCategory.CALENDAR_AND_VIDEO_CONFERENCING,
  [IntegrationAppType.ZOOM_MEETING]: IntegrationCategory.VIDEO_CONFERENCING,
  [IntegrationAppType.OUTLOOK_CALENDAR]: IntegrationCategory.CALENDAR,
}

const appTypeToTitleMap: Record<IntegrationAppType, string> = {
  [IntegrationAppType.GOOGLE_MEET_AND_CALENDAR]: "Google Meet & Calendar",
  [IntegrationAppType.ZOOM_MEETING]: "Zoom",
  [IntegrationAppType.OUTLOOK_CALENDAR]: "Outlook Calendar",
}

const handler = withAuth(async (req: NextRequest, userId: string) => {
  const userIntegrations = await prisma.integration.findMany({
    where: { userId },
  })

  const connectedMap = new Map(
    userIntegrations.map((integration) => [integration.appType, true])
  )

  const integrations = Object.values(IntegrationAppType).map((appType) => ({
    provider: appTypeToProviderMap[appType],
    title: appTypeToTitleMap[appType],
    app_type: appType,
    category: appTypeToCategoryMap[appType],
    isConnected: connectedMap.has(appType) || false,
  }))

  return NextResponse.json(
    {
      message: "Fetched user integrations successfully",
      integrations,
    },
    { status: HTTPSTATUS.OK }
  )
})

export const GET = withErrorHandling(handler)