import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { GroupDocument } from '~/models/schemas/group.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const ConversationSchema = new Schema({
  conversation_name: {
    type: Schema.Types.Mixed, // Có thể là một chuỗi hoặc một đối tượng.
    required: true,
    default: '',
  },
  is_group: { type: Boolean, default: false },
  group_id: {
    type: Schema.Types.ObjectId,
    ref: collection.GROUP,
    required: function (this: any) {
      return this.is_group
    }
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    required: true,
  },
  last_message_time: { // Thời gian tin nhắn mới nhất để sắp xếp danh sách tin nhắn phía fe, 
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

export interface ConversationDocument extends Document {
  conversation_name: string
  is_group: boolean
  group_id?: GroupDocument['_id']
  creator: UserDocument['_id']
  last_message_time: Date
  created_at: Date
  updated_at: Date
}

const Conversation = model<ConversationDocument>(collection.CONVERSATION, ConversationSchema)

export default Conversation
