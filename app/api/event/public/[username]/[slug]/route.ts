import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserNameAndSlugSchema } from '@/lib/validation'
import { withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'

const handler = withValidation(
  UserNameAndSlugSchema,
  async (req: NextRequest, data: any) => {
    const event = await prisma.event.findFirst({
      where: {
        slug: data.slug,
        isPrivate: false,
        user: {
          username: data.username,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        duration: true,
        locationType: true,
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Event details fetched successfully",
        event,
      },
      { status: HTTPSTATUS.OK }
    )
  }
)

export const GET = withErrorHandling((req: NextRequest, { params }: { params: { username: string; slug: string } }) => 
  handler(req, { username: params.username, slug: params.slug })
)