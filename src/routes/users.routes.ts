import { Router } from 'express'
import {
  changePasswordController,
  forgotPasswordController,
  googleLoginController,
  loginController,
  logoutController,
  meController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  searchUserController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/user.controller'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidation,
  changePasswordValidation,
  emailVerifyTokenValidation,
  forgotPasswordValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  resetPasswordValidation,
  updateMeValidation,
  verifiedUserValidation,
  verifyForgotPasswordTokenValidation
} from '~/middlewares/users.middleware'
import { updateMeReqBody } from '~/models/requests/users.requests'
import { wrapRequestHandler } from '~/utils/handlers'
import passport from "passport";

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
Description: This route is used to login with google
Method: GET
*/
// usersRouters.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
usersRouters.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

usersRouters.get('/google/callback', passport.authenticate('google', { session: false }), wrapRequestHandler(googleLoginController))

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
  verifiedUserValidation,
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

/*
Description: Resend email verification token
Path: /resend-verify-email
Method: POST
Headers: { Authorization : Bearer <accessToken> }
Body: { }
*/
usersRouters.post('/resend-verify-email', accessTokenValidation, wrapRequestHandler(resendVerifyEmailController))

/*
Description: Submit email to reset password , send email to user
Path: /forgot-password
Method: POST
Headers: { Authorization : Bearer <accessToken> }
Body: { }
*/
usersRouters.post('/forgot-password', forgotPasswordValidation, wrapRequestHandler(forgotPasswordController))

/*
Description: Verify email when user click on the link in the email to reset password
Path: /verify-forgot-password
Method: POST
Body: { forgot_password_token : string }
*/
usersRouters.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidation,
  wrapRequestHandler(verifyForgotPasswordController)
)

/*
Description: Reset password
Path: /reset-password
Method: POST
Body: { forgot_password_token : string , password : string , confirm_password : string }
*/
usersRouters.post('/reset-password', resetPasswordValidation, wrapRequestHandler(resetPasswordController))

/*
Description: change password
Path: /change-password
Headers: { Authorization : Bearer <accessToken> }
Method: PUT
Body : { old_password : string , new_password : string , confirm_password : string }
*/
usersRouters.put(
  '/change-password',
  accessTokenValidation,
  verifiedUserValidation,
  changePasswordValidation,
  wrapRequestHandler(changePasswordController)
)

/*
Description: Get my profile
Path: /me
Headers: { Authorization : Bearer <accessToken> }
Method: GET
*/
usersRouters.get('/me', accessTokenValidation, wrapRequestHandler(meController))

usersRouters.get('/search', accessTokenValidation, verifiedUserValidation, wrapRequestHandler(searchUserController))

export default usersRouters
