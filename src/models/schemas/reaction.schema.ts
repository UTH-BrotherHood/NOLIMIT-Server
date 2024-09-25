import { Schema, model, Document } from 'mongoose'
import { MessageDocument } from '~/models/schemas/message.schema'
import { UserDocument } from '~/models/schemas/user.schema'
import Collection from '~/constants/collection'

export interface ReactionDocument extends Document {
  message_id: MessageDocument['_id']
  user_id: UserDocument['_id']
  reaction_type: string
  created_at: Date
}

const ReactionSchema = new Schema({
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
  reaction_type: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export const Reaction = model<ReactionDocument>(Collection.REACTION, ReactionSchema)
