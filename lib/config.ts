export const config = {
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_PATH: process.env.BASE_PATH || "/api",

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_SECRET: process.env.JWT_SECRET || "secret_jwt",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "5d",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,

  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  FRONTEND_INTEGRATION_URL: process.env.FRONTEND_INTEGRATION_URL!,
}