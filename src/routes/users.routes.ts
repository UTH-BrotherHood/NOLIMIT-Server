import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/user.controllers'
import {
  accessTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation
} from '~/middlewares/users.middleware'

const usersRouters = Router()

/* 
Description: This route is used to register a new user
Method: POST
Body: { "username": "string", "email": "string", "password": "string", "confirmPassword": "string" ,"data_of_birth": ISO08601}
 */
usersRouters.post('/register', registerValidation, registerController)

/*
Description: This route is used to login a user
Method: POST
Body: { "email": "string", "password": "string"}
 */
usersRouters.post('/login', loginValidation, loginController)

/*
Description: This route is used to logout
Path: /logout
Method: POST
Headers: { Authorization : Bearer <accessToken> }
Body: { refresh_token : string}
*/
usersRouters.post('/logout', accessTokenValidation, refreshTokenValidation, logoutController)

export default usersRouters
