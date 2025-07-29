import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandling } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { MeetingFilterEnum, MeetingFilterEnumType } from '@/lib/utils'
import { MeetingStatus } from '@prisma/client'

const handler = withAuth(async (req: NextRequest, userId: string) => {
  const url = new URL(req.url)
  const filter = (url.searchParams.get('filter') as MeetingFilterEnumType) || MeetingFilterEnum.UPCOMING

  let where: any = { userId }

  if (filter === MeetingFilterEnum.UPCOMING) {
    where.status = MeetingStatus.SCHEDULED
    where.startTime = { gt: new Date() }
  } else if (filter === MeetingFilterEnum.PAST) {
    where.status = MeetingStatus.SCHEDULED
    where.startTime = { lt: new Date() }
  } else if (filter === MeetingFilterEnum.CANCELLED) {
    where.status = MeetingStatus.CANCELLED
  } else {
    where.status = MeetingStatus.SCHEDULED
    where.startTime = { gt: new Date() }
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      event: true,
    },
    orderBy: { startTime: 'asc' },
  })

  return NextResponse.json(
    {
      message: "Meetings fetched successfully",
      meetings: meetings || [],
    },
    { status: HTTPSTATUS.OK }
  )
})

export const GET = withErrorHandling(handler)