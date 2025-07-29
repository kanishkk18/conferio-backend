import { NextRequest, NextResponse } from 'next/server'
import { verifyJwtToken } from './auth'
import { HTTPSTATUS } from './http-status'
import { AppError } from './errors'

export function withAuth(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { message: 'Authorization header required' },
          { status: HTTPSTATUS.UNAUTHORIZED }
        )
      }

      const token = authHeader.substring(7)
      const payload = verifyJwtToken(token)
      
      return await handler(req, payload.userId)
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: HTTPSTATUS.UNAUTHORIZED }
      )
    }
  }
}

export function withErrorHandling(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            message: error.message,
            errorCode: error.errorCode,
          },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: HTTPSTATUS.INTERNAL_SERVER_ERROR }
      )
    }
  }
}

export function withValidation<T>(
  schema: any,
  handler: (req: NextRequest, data: T, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      let data: any

      if (req.method === 'GET') {
        const url = new URL(req.url)
        const params = Object.fromEntries(url.searchParams.entries())
        data = { ...params, ...args[0]?.params }
      } else {
        data = await req.json()
      }

      const validatedData = schema.parse(data)
      return await handler(req, validatedData, ...args)
    } catch (error: any) {
      if (error.errors) {
        return NextResponse.json(
          {
            message: 'Validation failed',
            errors: error.errors.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: HTTPSTATUS.BAD_REQUEST }
        )
      }

      throw error
    }
  }
}