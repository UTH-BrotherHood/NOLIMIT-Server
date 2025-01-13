import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

interface ErrorBodyType {
  message: string
  status: number
}
// { [key: string]: string }
type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: ErrorBodyType) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}

// class AppError extends Error {
//   public status: number
//   public isOperational: boolean
//   public errorType?: string

//   constructor(message: string, status: number, isOperational = true, errorType?: string) {
//     super(message)
//     this.status = status
//     this.isOperational = isOperational
//     this.errorType = errorType

//     Error.captureStackTrace(this, this.constructor)
//   }
// }

// class ValidationError extends AppError {
//   constructor(message = 'Validation error', errorType = 'VALIDATION_ERROR') {
//     super(message, 400, true, errorType)
//   }
// }

// class AuthenticationError extends AppError {
//   constructor(message = 'Invalid credentials', errorType = 'AUTHENTICATION_ERROR') {
//     super(message, 401, true, errorType)
//   }
// }

// export { AppError, ValidationError, AuthenticationError }
