import { ErrorRequestHandler } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { logger } from '~/loggers/myLogger.log'
// import myLoggerLog from '~/loggers/myLogger.log'
// import logger from '~/loggers/winston.log'
import { ErrorWithStatus } from '~/utils/errors'

export const defaultErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const requestInfo = {
    method: req.method,
    originalUrl: req.originalUrl,
    params: req.params,
    body: omit(req.body, ['password', 'confirmPassword']), // Loại bỏ các field nhạy cảm
    query: req.query,
    userIP: req.ip || req.socket.remoteAddress
  }

  // Log error với context và thông tin chi tiết
  logger.error(
    err.message,
    'ErrorHandler', // Tên của service/context
    Array.isArray(req.headers['x-request-id']) ? req.headers['x-request-id'][0] : req.headers['x-request-id'] || 'NO_REQUEST_ID', // requestId
    {
      errorName: err.name,
      errorStack: err.stack,
      status: err instanceof ErrorWithStatus ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      requestInfo
    }
  )

  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, 'status'))
    return
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, 'stack')
  })
  return
}
