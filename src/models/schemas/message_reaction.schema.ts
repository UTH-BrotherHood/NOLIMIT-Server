import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { MessageDocument } from '~/models/schemas/message.schema'
import { ReactionDocument } from '~/models/schemas/reaction.schema'
import { UserDocument } from '~/models/schemas/user.schema'

// Nếu người dùng có thể thêm nhiều phản ứng khác nhau trên cùng một tin nhắn (khác loại hoặc nhiều lần).
const MessageReactionSchema = new Schema({
  message_id: {
    type: Schema.Types.ObjectId,
    ref: collection.MESSAGE,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    required: true
  },
  reaction_id: {
    type: Schema.Types.ObjectId,
    ref: collection.REACTION,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export interface MessageReactionDocument extends Document {
  message_id: MessageDocument['_id']
  user_id: UserDocument['_id']
  reaction_id: ReactionDocument['_id']
  created_at: Date
}

export const MessageReaction = model<MessageReactionDocument>(collection.MESSAGE_REACTION, MessageReactionSchema)
