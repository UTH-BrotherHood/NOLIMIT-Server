import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { UserDocument } from '~/models/schemas/user.schema'

const NotificationSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    default: null
  },
  type: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export interface NotificationDocument extends Document {
  sender_id: UserDocument['_id'] // Người gửi thông báo (tùy chọn)
  type: string // Loại thông báo (ví dụ: 'message', 'contact', 'system', 'reminder')
  content: string // Nội dung thông báo (ví dụ: 'Bạn có tin nhắn mới')
  created_at: Date // Ngày tạo thông báo
}

export const Notification = model<NotificationDocument>(collection.NOTIFICATION, NotificationSchema)
