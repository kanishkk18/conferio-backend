import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Generate username for new users
            const username = await generateUsername(user.name || user.email!.split('@')[0])
            
            // Create user with availability
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                username,
                imageUrl: user.image,
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
            })
          } else if (!existingUser.username) {
            // Update existing user without username
            const username = await generateUsername(existingUser.name || existingUser.email.split('@')[0])
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { username },
            })
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.username = dbUser.username
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'database',
  },
}