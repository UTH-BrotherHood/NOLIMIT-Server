import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() })
    // const errorObjects = errors.mapped()
    // const entityError = new EntityError({ errors: {} })
    // for (const key in errorObjects) {
    //   const { msg } = errorObjects[key]
    //   if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    //     return next(msg)
    //   }
    //   entityError.errors[key] = errorObjects[key]
    // }

    // next(entityError)
  }
}
