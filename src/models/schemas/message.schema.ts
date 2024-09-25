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
  message_type: string
  attachments?: string[]
  created_at: Date
  updated_at: Date
}

export const Message = model<MessageDocument>(Collection.MESSAGE, MessageSchema)
