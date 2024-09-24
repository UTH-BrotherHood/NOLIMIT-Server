import {  Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/users.requests'
import usersService from '~/services/users.services'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: 'Register successfully',
    result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await usersService.login(req.body)
  return res.json({
    message: 'Login successfully',
    result
  })
}

