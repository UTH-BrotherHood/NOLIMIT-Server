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
  dbUsersCollection: process.env.DB_USERS_COLLECTION as string,
} as const