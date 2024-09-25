import { Schema, model, Document } from 'mongoose'
import Collection from '~/constants/collection'
import { MessageDocument } from '~/models/schemas/message.schema'

export interface AttachmentDocument extends Document {
  message_id: MessageDocument['_id']
  attachment_type: string
  file_url: string
  created_at: Date
}

const AttachmentSchema = new Schema({
  message_id: {
    type: Schema.Types.ObjectId,
    ref: Collection.MESSAGE,
    required: true
  },
  attachment_type: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

export const Attachment = model<AttachmentDocument>(Collection.ATTACHMENT, AttachmentSchema)
