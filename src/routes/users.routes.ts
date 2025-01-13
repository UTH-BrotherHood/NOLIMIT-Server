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
// 1. Kiểm tra access token.
// 2. Verify access token.
// 3. Nếu access token hết hạn, kiểm tra refresh token
// 4. Verify refresh token
// 5. Tạo access token mới
// 6. Cập nhật headers
// 7. Log việc refresh token để theo dõi
// 8. Nếu refresh token cũng hết hạn, Xóa refresh token, cũ bắt đăng nhập lại
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

// thêm route revoke token
// các tình huống cần revoke token:

// Các trường hợp bảo mật:

// Phát hiện tài khoản bị xâm nhập
// Người dùng thay đổi mật khẩu
// Phát hiện hoạt động đáng ngờ
// Admin cần vô hiệu hóa tài khoản người dùng


// Quản lý phiên đăng nhập:

// Người dùng muốn đăng xuất khỏi một thiết bị cụ thể
// Đăng xuất khỏi tất cả các thiết bị
// Xóa các phiên đăng nhập cũ


// Tuân thủ chính sách:

// Thực thi chính sách bảo mật mới
// Đáp ứng yêu cầu pháp lý
// Thực hiện các thay đổi hệ thống lớn

// Cách triển khai revoke token hiệu quả:

// Sử dụng Redis làm token blacklist:
// Lưu trữ các token đã bị thu hồi
// Tự động xóa token hết hạn
// Hiệu suất cao khi kiểm tra


// Xử lý đồng bộ:

// Đảm bảo tất cả server đều nhận được thông tin về token bị thu hồi
// Xử lý cache và đồng bộ giữa các instance
// Giải quyết race conditions


// Monitoring và Logging:

// Theo dõi các pattern revoke token bất thường
// Log đầy đủ thông tin về việc thu hồi
// Cảnh báo khi có nhiều revoke trong thời gian ngắn


// Trải nghiệm người dùng:


// Thông báo cho người dùng về việc phiên bị kết thúc
// Hướng dẫn người dùng đăng nhập lại
// Giải thích lý do token bị thu hồi(nếu phù hợp)

// Để triển khai hệ thống revoke token hiệu quả, bạn nên:

// Sử dụng cơ sở dữ liệu phù hợp(Redis thường là lựa chọn tốt)
// Có chiến lược clear blacklist định kỳ
// Implement rate limiting cho các API revoke
// Có system monitoring để phát hiện vấn đề