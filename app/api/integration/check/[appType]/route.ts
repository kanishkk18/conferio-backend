import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AppTypeSchema } from '@/lib/validation'
import { withAuth, withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'

const handler = withAuth(
  withValidation(
    AppTypeSchema,
    async (req: NextRequest, data: any, userId: string) => {
      const integration = await prisma.integration.findFirst({
        where: { 
          userId, 
          appType: data.appType 
        },
      })

      return NextResponse.json(
        {
          message: "Integration checked successfully",
          isConnected: !!integration,
        },
        { status: HTTPSTATUS.OK }
      )
    }
  )
)

export const GET = withErrorHandling((req: NextRequest, { params }: { params: { appType: string } }) => 
  handler(req, { appType: params.appType })
)