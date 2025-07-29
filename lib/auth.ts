import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { config } from './config'

export type AccessTokenPayload = {
  userId: string
}

export const hashValue = async (value: string, saltRounds: number = 10) =>
  await bcrypt.hash(value, saltRounds)

export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue)

export const signJwtToken = (payload: AccessTokenPayload) => {
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    audience: ["user"],
  })

  const decodedToken = jwt.decode(token) as jwt.JwtPayload | null
  const expiresAt = decodedToken?.exp ? decodedToken.exp * 1000 : null

  return {
    token,
    expiresAt,
  }
}

export const verifyJwtToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, config.JWT_SECRET, {
    audience: ["user"],
  }) as AccessTokenPayload
}