import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { ConversationDocument } from '~/models/schemas/conversation.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const MessageSchema = new Schema({
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.CONVERSATION,
    required: true
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  message_content: {
    type: String,
    required: true
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'code', 'inviteV2', 'system'],
    default: 'text'
  },
  // lưu trữ đường dẫn của file đính kèm.
  attachments: [
    {
      type: String
    }
  ],
  is_read: {
    type: Boolean,
    default: false // Mặc định là chưa xem
  },
  read_by: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

export interface MessageDocument extends Document {
  conversation_id: ConversationDocument['_id']
  sender_id: UserDocument['_id']
  message_content: string
  message_type: string // Loại tin nhắn
  attachments?: string[] // Đường dẫn file đính kèm
  is_read: boolean // Trạng thái xem của tin nhắn
  read_by: UserDocument['_id'][] // Danh sách người đã xem tin nhắn
  created_at: Date
  updated_at: Date
}

export const Message = model<MessageDocument>(Collection.MESSAGE, MessageSchema)
