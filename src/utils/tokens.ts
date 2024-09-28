import jwt, { SignOptions } from 'jsonwebtoken'
import { envConfig } from '~/constants/config'
import { USERS_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/users.requests'

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, rejects) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        throw rejects(err)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublickey }: { token: string; secretOrPublickey: string }) => {
  return new Promise<TokenPayload>((resolve, rejects) => {
    jwt.verify(token, secretOrPublickey, (err, decoded) => {
      if (err) {
        throw rejects(err)
        // throw rejects(USERS_MESSAGES.UNAUTHORIZED)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
