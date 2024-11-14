import { config } from 'dotenv'
import argv from 'minimist'
const options = argv(process.argv.slice(2))

export const isProduction = options.env === 'production'

config({
  path: options.env ? `.env.${options.env}` : '.env'
})

export const envConfig = {
  host: process.env.HOST as string,
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_NAME as string,
  port: (process.env.PORT as string) || 3000,
  clientUrl: process.env.CLIENT_URL as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  accessTokenExpiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN as string,
  refreshTokenExpiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  emailVerifyTokenExpiresIn: process.env.JWT_EXPIRES_IN_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPassToken: process.env.JWT_SECRET_FORGOT_PASS_TOKEN as string,
  forgotPasswordTokenExpiresIn: process.env.JWT_EXPIRES_IN_FORGOT_PASS_TOKEN as string,
  resendApiKey: process.env.RESEND_API_KEY as string,
  resendFromAddress: process.env.RESEND_FROM_ADDRESS as string,

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleCallbackURLDev: process.env.GOOGLE_CALLBACK_URL_DEV as string,
  googleCallbackURLProd: process.env.GOOGLE_CALLBACK_URL_PROD as string,
  googleRedirectClientUrl: process.env.GOOGLE_REDIRECT_CLIENT_URL as string,

  // Session
  sessionSecret: process.env.SESSION_SECRET as string,
  nodeEnv: process.env.NODE_ENV as string,

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY as string,
} as const
