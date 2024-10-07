import { JwtPayload } from 'jsonwebtoken'
import { tokenType, userVerificationStatus } from '~/constants/enums'
export interface RegisterReqBody {
  username: string
  email: string
  password: string
  date_of_birth: Date
  status?: string
  created_at?: Date
  updated_at?: Date
  last_login_time?: Date
}
export interface LoginReqBody {
  email: string
  password: string
}

export interface updateMeReqBody {
  username?: string
  date_of_birth?: string
  bio?: string
  avatar_url?: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: tokenType
  verify: userVerificationStatus
  exp: number
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface EmailVerifyReqBody {
  email_verification_token: string
}
export interface ForgotPasswordReqBody {
  email: string
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}
export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
