import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { UserDocument } from '~/models/schemas/user.schema'

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
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
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export interface NotificationDocument extends Document {
  recipient: UserDocument['_id'] // Người nhận thông báo
  sender?: UserDocument['_id'] // Người gửi thông báo (tùy chọn)
  type: string // Loại thông báo (ví dụ: 'message', 'contact', 'system')
  content: string // Nội dung thông báo (ví dụ: 'Bạn có tin nhắn mới')
  is_read: boolean // Trạng thái đã đọc
  created_at: Date // Ngày tạo thông báo
}

export const Notification = model<NotificationDocument>(Collection.NOTIFICATION, NotificationSchema)
