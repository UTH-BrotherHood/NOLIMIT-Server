import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { UserDocument } from '~/models/schemas/user.schema'

const ContactSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    required: true
  },
  contact_user_id: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    required: true
  },
  nickname: {
    type: String,
    default: ''
  },
  is_favorite: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export interface ContactDocument extends Document {
  user_id: UserDocument['_id'] // Người dùng sở hữu danh sách liên hệ
  contact_user_id: UserDocument['_id'] // Người dùng được lưu vào danh sách liên hệ
  nickname?: string // Tùy chọn: có thể đặt biệt danh cho người liên hệ
  is_favorite: boolean // Tùy chọn: có thể đánh dấu người liên hệ là yêu thích
  created_at: Date
}

export const Contact = model<ContactDocument>(collection.CONTACT, ContactSchema)
