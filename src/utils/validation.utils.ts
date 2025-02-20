import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
// import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/utils/errors'

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req)

    // if there are no errors, continue to the next middleware
    if (errors.isEmpty()) {
      return next()
    }
    // if there are errors, return an error response
    const errorObjects = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObjects) {
      const { msg } = errorObjects[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorObjects[key]
    }

    next(entityError)
  }
}
