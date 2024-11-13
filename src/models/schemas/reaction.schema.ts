import { Schema, model, Document } from 'mongoose'
import { MessageDocument } from '~/models/schemas/message.schema'
import { UserDocument } from '~/models/schemas/user.schema'
import collection from '~/constants/collection'


const ReactionSchema = new Schema({
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
  reaction_type: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})


export interface ReactionDocument extends Document {
  message_id: MessageDocument['_id']
  user_id: UserDocument['_id']
  reaction_type: string
  created_at: Date
}

export const Reaction = model<ReactionDocument>(collection.REACTION, ReactionSchema)
