import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { USERS_MESSAGES } from '~/constants/messages'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/users.requests'
import usersService from '~/services/users.services'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    return res.json({
      message: USERS_MESSAGES.REGISTER_SUCCESSFULLY,
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : USERS_MESSAGES.UNKNOW_ERROR
    return res.status(500).json({
      message: USERS_MESSAGES.REGISTER_FAILED,
      error: errorMessage
    })
  }
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  try {
    const result = await usersService.login(req.body)
    return res.json({
      message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : USERS_MESSAGES.UNKNOW_ERROR

    if (errorMessage === USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT) {
      return res.status(400).json({
        message: errorMessage
      })
    }

    return res.status(500).json({
      message: USERS_MESSAGES.UNKNOW_ERROR,
      error: errorMessage
    })
  }
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, { refresh_token: string }>,
  res: Response
) => {
  try {
    await usersService.logout(req.body.refresh_token)
    return res.json({
      message: USERS_MESSAGES.LOGOUT_SUCCESSFULLY
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : USERS_MESSAGES.UNKNOW_ERROR
    return res.status(500).json({
      message: USERS_MESSAGES.LOGOUT_FAILED,
      error: errorMessage
    })
  }
}
