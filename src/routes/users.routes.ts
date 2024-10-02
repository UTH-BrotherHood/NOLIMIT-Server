import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/user.controllers'
import {
  accessTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouters = Router()

/* 
Description: This route is used to register a new user
Method: POST
Body: { "username": "string", "email": "string", "password": "string", "confirmPassword": "string" ,"data_of_birth": ISO08601}
 */
usersRouters.post('/register', registerValidation, wrapRequestHandler(registerController))

/*
Description: This route is used to login a user
Method: POST
Body: { "email": "string", "password": "string"}
 */
usersRouters.post('/login', loginValidation, wrapRequestHandler(loginController))

/*
Description: This route is used to logout
Path: /logout
Method: POST
Headers: { Authorization : Bearer <accessToken> }
Body: { refresh_token : string}
*/
usersRouters.post('/logout', accessTokenValidation, refreshTokenValidation, wrapRequestHandler(logoutController))

/*
Description: Refresh token
Path: /refresh-token
Method: POST
Body: { refresh_token : string}
*/
usersRouters.post('/refresh-token', refreshTokenValidation, wrapRequestHandler(refreshTokenController))
export default usersRouters
