import { LoginReqBody, RegisterReqBody, updateMeReqBody } from '~/models/requests/users.requests'
import User from '~/models/schemas/user.schema'
import databaseServices from '~/services/database.services'
import bcrypt from 'bcrypt'
import { signToken, verifyToken } from '~/utils/tokens'
import { envConfig } from '~/constants/config'
import { tokenType, userVerificationStatus } from '~/constants/enums'
import { Token } from '~/models/schemas/token.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/utils/errors'
import HTTP_STATUS from '~/constants/httpStatus'

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: userVerificationStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: tokenType.AccessToken,
        verify
      },
      privateKey: envConfig.jwtSecretAccessToken,
      options: {
        expiresIn: envConfig.accessTokenExpiresIn
      }
    })
  }

  private signRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: userVerificationStatus
    exp?: number
  }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: tokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: envConfig.jwtSecretRefreshToken,
        options: {
          expiresIn: exp
        }
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: tokenType.RefreshToken,
        verify
      },
      privateKey: envConfig.jwtSecretRefreshToken,
      options: {
        expiresIn: envConfig.refreshTokenExpiresIn
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: userVerificationStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: tokenType.EmailVerificationToken,
        verify
      },
      privateKey: envConfig.jwtSecretEmailVerifyToken,
      options: {
        expiresIn: envConfig.emailVerifyTokenExpiresIn
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: userVerificationStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: tokenType.EmailVerificationToken,
        verify
      },
      privateKey: envConfig.jwtSecretForgotPassToken,
      options: {
        expiresIn: envConfig.forgotPasswordTokenExpiresIn
      }
    })
  }

  private decodeEmailVerifyToken(email_verify_token: string) {
    return verifyToken({
      token: email_verify_token,
      secretOrPublickey: envConfig.jwtSecretEmailVerifyToken
    })
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublickey: envConfig.jwtSecretRefreshToken
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: userVerificationStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    // Tạo mã token xác minh email
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: userVerificationStatus.Unverified
    })
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(payload.password, 10)

    // Tạo người dùng mới với mật khẩu đã mã hóa
    const newUser = new User({
      _id: user_id,
      ...payload,
      password: hashedPassword
    })

    // Lưu người dùng mới vào cơ sở dữ liệu
    await databaseServices.users.insertOne(newUser)
    // Lưu verify email token  và refresh token vào cơ sở dữ liệu
    const { iat: iat_email_verify_token, exp: exp_email_verify_token } =
      await this.decodeEmailVerifyToken(email_verify_token)

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: userVerificationStatus.Unverified
    })
    const { iat: iat_refresh_token, exp: exp_refresh_token } = await this.decodeRefreshToken(refresh_token)

    await databaseServices.tokens.insertOne(
      new Token({
        user_id,
        token: email_verify_token,
        type: tokenType.EmailVerificationToken,
        expires_at: new Date((exp_email_verify_token as number) * 1000),
        created_at: new Date((iat_email_verify_token as number) * 1000)
      })
    )
    await databaseServices.tokens.insertOne(
      new Token({
        user_id,
        token: refresh_token,
        type: tokenType.RefreshToken,
        expires_at: new Date((exp_refresh_token as number) * 1000),
        created_at: new Date((iat_refresh_token as number) * 1000)
      })
    )

    // Xóa các token cũ nếu tồn tại để đảm bảo không có refresh token dư thừa ( em vương nghĩ để trong login sẽ hợp lý hơn)
    // await databaseServices.tokens.deleteMany({ user_id: user_id, type: tokenType.RefreshToken })

    // Tạo email verify token (nếu có yêu cầu xác minh email)
    // const emailVerifyToken = this.signEmailVerifyToken({
    //   user_id: result.insertedId.toString(),
    //   verify: newUser.verify
    // })

    console.info('Email Verify Token:', email_verify_token)

    return {
      access_token,
      refresh_token
    }
  }

  async login(payload: LoginReqBody) {
    const { email, password } = payload

    const user = (await databaseServices.users.findOne({ email })) as {
      _id: { toString: () => string }
      password: string
      verify: userVerificationStatus
    }

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user._id.toString(),
      verify: user.verify
    })

    await databaseServices.tokens.deleteMany({ user_id: user._id, type: tokenType.RefreshToken })

    const { exp } = await this.decodeRefreshToken(refresh_token)

    await databaseServices.tokens.insertOne(
      new Token({
        user_id: user._id.toString(),
        token: refresh_token,
        type: tokenType.RefreshToken,
        expires_at: new Date(exp * 1000)
      })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    const { user_id } = await usersService.decodeRefreshToken(refresh_token)
    await databaseServices.tokens.deleteOne({ user_id: new ObjectId(user_id), token: refresh_token })
  }

  async checkEmailExist(email: string) {
    const user = await databaseServices.users.findOne({ email })
    return !!user
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: userVerificationStatus
    refresh_token: string
    exp: number
  }) {
    const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) as any })

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const token = await databaseServices.tokens.findOne({ user_id: new ObjectId(user_id), token: refresh_token })

    if (!token) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (token.expires_at.getTime() < Date.now()) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_EXPIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const [access_token, new_refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })

    await databaseServices.tokens.deleteOne({ user_id: new ObjectId(user_id), token: refresh_token })

    const { exp: new_exp } = await this.decodeRefreshToken(new_refresh_token)

    await databaseServices.tokens.insertOne(
      new Token({
        user_id,
        token: new_refresh_token,
        type: tokenType.RefreshToken,
        expires_at: new Date(new_exp * 1000)
      })
    )

    return {
      access_token,
      refresh_token: new_refresh_token
    }
  }

  async updateMe(user_id: string, payload: updateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseServices.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id) as any
      },
      {
        $set: {
          ...(_payload as updateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: { updated_at: true }
      }
    )

    const result = await databaseServices.users.findOne({ _id: new ObjectId(user_id) as any })
    if (!result) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const { _id, password, forgot_password, ...userWithoutPassword } = result

    return userWithoutPassword
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: userVerificationStatus.Verified }),
      databaseServices.tokens.updateOne(
        { user_id: new ObjectId(user_id), type: tokenType.EmailVerificationToken },
        {
          $set: {
            token: ''
          },
          $currentDate: { updated_at: true }
        }
      ),

      databaseServices.users.updateOne(
        { _id: new ObjectId(user_id) as any },
        {
          $set: {
            verify: userVerificationStatus.Verified
          },
          $currentDate: { updated_at: true }
        }
      )
    ])

    const [access_token, refresh_token] = token
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseServices.tokens.insertOne(
      new Token({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        type: tokenType.RefreshToken,
        expires_at: new Date((exp as number) * 1000),
        created_at: new Date((iat as number) * 1000)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string, email: string, username: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: userVerificationStatus.Verified
    })
    // gửi email verify token
    // await sendVerifyRegisterEmail(email, username, email_verify_token)
    console.log('Resend email verify token : ', email_verify_token)
    await databaseServices.tokens.updateOne(
      { user_id: new ObjectId(user_id), type: tokenType.EmailVerificationToken },
      {
        $set: {
          token: email_verify_token
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESSFULLY
    }
  }

  async forgotPassword({
    user_id,
    verify,
    email,
    username
  }: {
    user_id: string
    verify: userVerificationStatus
    email: string
    username: string
  }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password: forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )
    // gửi email chứa link reset password đến email của user : http://localhost:3000/reset-password?token=forgot_password_token
    // sendForgotPassWordEmail(email, username, forgot_password_token)
    console.log('Forgot password token : ', forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(user_id: string, password: string) {
    databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: await bcrypt.hash(password, 10),
          forgot_password_token: ''
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESSFULLY
    }
  }

  async changePassword(user_id: string, new_password: string) {
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: await bcrypt.hash(new_password, 10)
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESSFULLY
    }
  }
}

const usersService = new UsersService()
export default usersService
