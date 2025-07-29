import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compareValue, signJwtToken } from '@/lib/auth'
import { LoginSchema } from '@/lib/validation'
import { withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { NotFoundException, UnauthorizedException } from '@/lib/errors'

const handler = withValidation(
  LoginSchema,
  async (req: NextRequest, data: any) => {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const isPasswordValid = await compareValue(data.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email/password")
    }

    const { token, expiresAt } = signJwtToken({ userId: user.id })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "User logged in successfully",
        user: userWithoutPassword,
        accessToken: token,
        expiresAt,
      },
      { status: HTTPSTATUS.OK }
    )
  }
)

export const POST = withErrorHandling(handler)