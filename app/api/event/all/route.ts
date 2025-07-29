import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandling } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException } from '@/lib/errors'

const handler = withAuth(async (req: NextRequest, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      events: {
        include: {
          _count: {
            select: { meetings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    throw new NotFoundException("User not found")
  }

  return NextResponse.json(
    {
      message: "User events fetched successfully",
      data: {
        events: user.events,
        username: user.username,
      },
    },
    { status: HTTPSTATUS.OK }
  )
})

export const GET = withErrorHandling(handler)