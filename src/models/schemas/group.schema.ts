import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { NAME_REGEXP } from '~/constants/regex'

const GroupSchema = new Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    match: NAME_REGEXP,
    index: true
  },
  avatar_url: {
    type: String,
    default: ''
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: Collection.USER,
    required: true
  },
  // lưu trữ thông báo của nhóm (group).
  announcement: {
    type: String,
    default: ''
  },
  members: [
    {
      type: [Schema.Types.ObjectId],
      ref: Collection.USER,
      required: true
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

export interface GroupDocument extends Document {
  name: string
  avatar: string
  announcement: string
  creator: string
  members: string[]
  created_at: Date
  updated_at: Date
}

const Group = model<GroupDocument>(Collection.GROUP, GroupSchema)

export default Group
