import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { HTTP_MESSAGES } from '~/constants/messages'
import { EntityError, ErrorWithStatus } from '~/utils/errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.warn(`Error: ${err.message} at ${req.method} ${req.url}`)
  // console.log('Full error details:', err)

  if (res.headersSent) {
    console.log('Headers already sent, skipping error handler...')
    return next(err)
  }

  if (err instanceof EntityError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors
    })
  }

  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json({
      message: err.message
    })
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
    errorInfo: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  })
}
