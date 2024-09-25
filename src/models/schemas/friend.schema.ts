import { Schema, model, Document } from 'mongoose'
import { UserDocument } from '~/models/schemas/user.schema'
import Collection from '~/constants/collection'

export interface FriendRequestDocument extends Document {
  sender_id: UserDocument['_id']
  receiver_id: UserDocument['_id']
  status: string
  created_at: Date
  updated_at: Date
}

const FriendRequestSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  receiver_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
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

export const FriendRequest = model<FriendRequestDocument>('FriendRequest', FriendRequestSchema)
