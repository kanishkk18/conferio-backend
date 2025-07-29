import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashValue } from '@/lib/auth'
import { RegisterSchema } from '@/lib/validation'
import { withErrorHandling, withValidation } from '@/lib/middleware'
import { HTTPSTATUS } from '@/lib/http-status'
import { BadRequestException } from '@/lib/errors'
import { v4 as uuidv4 } from 'uuid'
import { DayOfWeek } from '@prisma/client'

async function generateUsername(name: string): Promise<string> {
  const cleanName = name.replace(/\s+/g, "").toLowerCase()
  const baseUsername = cleanName

  const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4)

  let username = `${baseUsername}${uuidSuffix}`
  let existingUser = await prisma.user.findUnique({
    where: { username },
  })

  while (existingUser) {
    username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`
    existingUser = await prisma.user.findUnique({
      where: { username },
    })
  }

  return username
}

const handler = withValidation(
  RegisterSchema,
  async (req: NextRequest, data: any) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new BadRequestException("User already exists")
    }

    const username = await generateUsername(data.name)
    const hashedPassword = await hashValue(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        username,
        availability: {
          create: {
            timeGap: 30,
            days: {
              create: Object.values(DayOfWeek).map((day) => ({
                day,
                startTime: new Date(`2025-03-01T09:00:00Z`),
                endTime: new Date(`2025-03-01T17:00:00Z`),
                isAvailable: day !== DayOfWeek.SUNDAY && day !== DayOfWeek.SATURDAY,
              })),
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: HTTPSTATUS.CREATED }
    )
  }
)

export const POST = withErrorHandling(handler)