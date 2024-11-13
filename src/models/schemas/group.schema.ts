import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { NAME_REGEXP } from '~/constants/regex'
import { UserDocument } from './user.schema'

const GroupSchema = new Schema({
  name: {
    type: String,
    trim: true,
    match: NAME_REGEXP,
    index: true,
    required: true
  },
  avatar_url: {
    type: String,
    default: ''
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: collection.USER,
    required: true
  },
  // lưu trữ thông báo của nhóm (group).
  announcement: {
    type: String,
    default: ''
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

export interface GroupDocument extends Document {
  name: string
  avatar_url: string
  announcement: string
  creator: UserDocument['_id'],
  created_at: Date
  updated_at: Date
}

const Group = model<GroupDocument>(collection.GROUP, GroupSchema)

export default Group
