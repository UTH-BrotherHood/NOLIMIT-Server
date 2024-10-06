import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { HTTP_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import {
  LoginReqBody,
  RegisterReqBody,
  TokenPayload,
  RefreshTokenReqBody,
  updateMeReqBody,
  EmailVerifyReqBody
} from '~/models/requests/users.requests'
import databaseServices from '~/services/database.services'
import usersService from '~/services/users.services'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { tokenType } from '~/constants/enums'
interface CustomRequest extends Request {
  decoded_refresh_token?: TokenPayload
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESSFULLY,
    data: result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await usersService.login(req.body)
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
    data: result
  })
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
    const errorMessage = error instanceof Error ? error.message : HTTP_MESSAGES.UNKNOW_ERROR
    return res.status(500).json({
      message: USERS_MESSAGES.LOGOUT_FAILED,
      error: errorMessage
    })
  }
}

export const refreshTokenController = async (req: CustomRequest, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, verify, refresh_token, exp })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY,
    data: result
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, updateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESSFULLY,
    result: user
  })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, EmailVerifyReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }
  // đã verify rồi thì không báo lỗi
  //   mà sẽ trả về status OK với message là email đã được verify trước đó rồi
  const token = await databaseServices.tokens.findOne({
    user_id: new ObjectId(user_id),
    type: tokenType.EmailVerificationToken
  })

  if (token) {
    if (token.token === '') {
      return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED })
    }
    const result = await usersService.verifyEmail(user_id)
    return res.json({
      message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
      result
    })
  }
}
