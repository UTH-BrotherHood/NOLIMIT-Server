import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { EMAIL_REGEXP, NAME_REGEXP } from '~/constants/const'

const UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    match: NAME_REGEXP,
    index: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    match: EMAIL_REGEXP,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  date_of_birth: { type: Date, default: Date.now },
  avatar_url: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  tag: {
    type: String,
    default: '',
    trim: true,
    match: NAME_REGEXP
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  lastLoginTime: { type: Date, default: Date.now }
})

export interface UserDocument extends Document {
  username: string
  email: string
  password: string
  date_of_birth: Date
  avatar_url: string
  status: string
  tag: string
  created_at: Date
  updated_at: Date
  lastLoginTime: Date
}

const User = model<UserDocument>(Collection.USER, UserSchema)

export default User
