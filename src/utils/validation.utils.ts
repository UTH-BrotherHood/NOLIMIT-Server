import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/utils/errors'

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() })

    // const errorObjects = errors.mapped() // Lấy các lỗi dưới dạng đối tượng với từng trường là khóa
    // const entityError = new EntityError({ errors: {} }) // Tạo một đối tượng lỗi tùy chỉnh

    // for (const key in errorObjects) {
    //   // Duyệt qua từng lỗi trong đối tượng lỗi
    //   const { msg } = errorObjects[key] // Lấy thông báo lỗi cho từng trường

    //   if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    //     return next(msg) // Nếu gặp lỗi đặc biệt (có kiểu là `ErrorWithStatus` và không phải mã 422), chuyển tiếp lỗi này
    //   }
    //   entityError.errors[key] = errorObjects[key] // Gán lỗi vào đối tượng `EntityError`
    // }

    // next(entityError) // Chuyển đối tượng lỗi tùy chỉnh đến middleware tiếp theo
  }
}
