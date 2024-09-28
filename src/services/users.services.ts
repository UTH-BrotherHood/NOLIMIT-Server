import { LoginReqBody, RegisterReqBody } from '~/models/requests/users.requests'
import User from '~/models/schemas/user.schema'
import databaseServices from '~/services/database.services'
import bcrypt from 'bcrypt'
import { signToken, verifyToken } from '~/utils/tokens'
import { envConfig } from '~/constants/config'
import { tokenType, userVerificationStatus } from '~/constants/enums'
import { Token } from '~/models/schemas/token.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'

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
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(payload.password, 10)

    // Tạo người dùng mới với mật khẩu đã mã hóa
    const newUser = new User({
      ...payload,
      password: hashedPassword,
      verify: userVerificationStatus.Unverified // Mặc định trạng thái người dùng chưa xác minh
    })

    // Lưu người dùng mới vào cơ sở dữ liệu
    const result = (await databaseServices.users.insertOne(newUser)) as { insertedId: { toString: () => string } }

    // Sau khi đăng ký thành công, tạo Access Token và Refresh Token cho người dùng
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: result.insertedId.toString(),
      verify: userVerificationStatus.Verified
    })

    // Xóa các token cũ nếu tồn tại để đảm bảo không có refresh token dư thừa
    await databaseServices.tokens.deleteMany({ user_id: result.insertedId.toString(), type: tokenType.RefreshToken })

    // Giải mã Refresh Token để lấy thời gian hết hạn
    const { exp } = await this.decodeRefreshToken(refresh_token)

    // THÊM REFRESH TOKEN VÀO TOKEN COLLECTION
    await databaseServices.tokens.insertOne(
      new Token({
        user_id: result.insertedId.toString(),
        token: refresh_token,
        type: tokenType.RefreshToken,
        expires_at: new Date(exp * 1000)
      })
    )

    // Tạo email verify token (nếu có yêu cầu xác minh email)
    // const emailVerifyToken = this.signEmailVerifyToken({
    //   user_id: result.insertedId.toString(),
    //   verify: newUser.verify
    // })

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
      throw new Error(USERS_MESSAGES.EMAIL_NOT_EXIST)
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
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
}

const usersService = new UsersService()
export default usersService
