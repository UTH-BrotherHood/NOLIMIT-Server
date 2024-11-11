import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { ConversationDocument } from '~/models/schemas/conversation.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const ConversationSettingsSchema = new Schema({
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: collection.CONVERSATION,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    required: true
  },
  is_muted: {
    type: Boolean,
    default: false
  },
  notification_level: {
    type: String,
    default: 'all'
  }
})

export interface ConversationSettingsDocument extends Document {
  conversation_id: ConversationDocument['_id']
  user_id: UserDocument['_id']
  is_muted: boolean
  notification_level: string // all, mention, none (tắt thông báo)
}

export const ConversationSettings = model<ConversationSettingsDocument>(
  collection.CONVERSATION_SETTING,
  ConversationSettingsSchema
)
