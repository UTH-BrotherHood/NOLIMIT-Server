import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

interface ErrorBodyType {
  message: string
  status: number
}

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus extends Error {
  status: number
  constructor({ message, status }: ErrorBodyType) {
    super(message)
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

export const createValidationError = (errors: any) => {
  const entityError = new EntityError({ message: USERS_MESSAGES.VALIDATION_ERROR, errors: {} })

  for (const key in errors) {
    const msg = errors[key]
    entityError.errors[key] = { ...msg }
  }

  return entityError
}
