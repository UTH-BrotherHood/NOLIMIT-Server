import { Schema, model, Document } from 'mongoose'
import { MessageDocument } from '~/models/schemas/message.schema'
import { UserDocument } from '~/models/schemas/user.schema'
import collection from '~/constants/collection'


const ReactionSchema = new Schema({
  reaction_type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'angry', 'sad', 'wow'], // Loại reaction: like, love, laugh, angry, sad, wow
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})


export interface ReactionDocument extends Document {
  reaction_type: string
  created_at: Date
}

export const Reaction = model<ReactionDocument>(collection.REACTION, ReactionSchema)
