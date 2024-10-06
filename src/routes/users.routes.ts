import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateMeController,
  verifyEmailController
} from '~/controllers/user.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidation,
  emailVerifyTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  updateMeValidation
} from '~/middlewares/users.middleware'
import { updateMeReqBody } from '~/models/requests/users.requests'
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

/*
Description: Update my profile
Path: /me
Headers: { Authorization : Bearer <accessToken> }
Method: PATCH
Body : User Schema
*/
usersRouters.patch(
  '/me',
  accessTokenValidation,
  updateMeValidation,
  filterMiddleware<updateMeReqBody>(['date_of_birth', 'bio', 'username', 'avatar_url']),
  wrapRequestHandler(updateMeController)
)

/*
Description: Verify email when user click on the link in the email
Path: /verify-email
Method: POST
Body: { email_verification_token : string}
*/
usersRouters.post('/verify-email', emailVerifyTokenValidation, wrapRequestHandler(verifyEmailController))

export default usersRouters
