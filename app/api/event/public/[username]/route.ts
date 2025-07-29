import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserNameSchema } from '@/lib/validation'
import { withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException } from '@/lib/errors'

const handler = withValidation(
  UserNameSchema,
  async (req: NextRequest, data: any) => {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        events: {
          where: { isPrivate: false },
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            duration: true,
            locationType: true,
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
        message: "Public events fetched successfully",
        user: {
          name: user.name,
          username: data.username,
          imageUrl: user.imageUrl,
        },
        events: user.events,
      },
      { status: HTTPSTATUS.OK }
    )
  }
)

export const GET = withErrorHandling((req: NextRequest, { params }: { params: { username: string } }) => 
  handler(req, { username: params.username })
)