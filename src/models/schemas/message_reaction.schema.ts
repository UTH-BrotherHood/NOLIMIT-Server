import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { MessageDocument } from '~/models/schemas/message.schema'
import { ReactionDocument } from '~/models/schemas/reaction.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const MessageReactionSchema = new Schema({
  message_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.MESSAGE,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  reaction_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.REACTION,
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

export const MessageReaction = model<MessageReactionDocument>(Collection.MESSAGE_REACTION, MessageReactionSchema)
