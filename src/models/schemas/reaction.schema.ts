import { Schema, model, Document } from 'mongoose'
import { MessageDocument } from '~/models/schemas/message.schema'
import { UserDocument } from '~/models/schemas/user.schema'
import Collection from '~/constants/collection'

const ReactionSchema = new Schema({
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
  reaction_type: string // Loại reaction: like, love, haha, wow, sad, angry
  created_at: Date
}

export const Reaction = model<ReactionDocument>(Collection.REACTION, ReactionSchema)
