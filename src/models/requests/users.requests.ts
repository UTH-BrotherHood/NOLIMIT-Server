import { JwtPayload } from 'jsonwebtoken'
import { tokenType, userVerificationStatus } from '~/constants/enums'
export interface RegisterReqBody {
  username: string
  email: string
  password: string
  date_of_birth: Date
  avatar_url?: string
  status?: string
  tag?: string
  forgotPassword?: string
  created_at?: Date
  updated_at?: Date
  last_login_time?: Date
}
export interface LoginReqBody {
  email: string
  password: string
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
