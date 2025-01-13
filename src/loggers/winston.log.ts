import { createLogger, format, transports } from 'winston'
const { combine, timestamp, printf, align } = format

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A'
    }),
    align(),
    printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      dirname: 'logs',
      filename: 'test.log'
    })
  ]
})

export default logger
