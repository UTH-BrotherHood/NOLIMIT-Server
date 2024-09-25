import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { UserDocument } from '~/models/schemas/user.schema'

const TokenSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export interface TokenDocument extends Document {
  user_id: UserDocument['_id'] // Tham chiếu đến người dùng sở hữu token này
  token: string // Mã token
  type: string // Loại token (vd: 'reset-password', 'verify-email', )
  expires_at: Date // Thời gian hết hạn token
  created_at: Date // Thời gian tạo token
}

export const Token = model<TokenDocument>(Collection.TOKEN, TokenSchema)
