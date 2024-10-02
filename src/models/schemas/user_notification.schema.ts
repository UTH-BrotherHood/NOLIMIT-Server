import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { NotificationDocument } from '~/models/schemas/notification.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const UserNotificationSchema = new Schema({
  notification_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.NOTIFICATION,
    required: true
  },
  recipient_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
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

export interface UserNotificationDocument extends Document {
  notification_id: NotificationDocument['_id']
  recipient_id: UserDocument['_id'] // Người dùng nhận thông báo
  is_read: boolean
  created_at: Date
}

export const UserNotification = model<UserNotificationDocument>(Collection.USER_NOTIFICATION, UserNotificationSchema)
