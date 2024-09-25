import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { GroupDocument } from '~/models/schemas/group.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const ConversationSchema = new Schema({
  conversation_name: { type: String, default: '' },
  is_group: { type: Boolean, default: false },
  group_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.GROUP,
    required: function (this: any) {
      return this.is_group
    }
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: Collection.USER,
      required: true
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

export interface ConversationDocument extends Document {
  conversation_name: string
  is_group: boolean
  group_id?: GroupDocument['_id']
  participants: UserDocument['_id'][]
  created_at: Date
  updated_at: Date
}

const Conversation = model<ConversationDocument>(Collection.CONVERSATION, ConversationSchema)

export default Conversation
