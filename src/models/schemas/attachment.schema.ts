import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { MessageDocument } from './message.schema'

const AttachmentSchema = new Schema({
  attachment_type: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  message_id: {
    type: Schema.Types.ObjectId,
    ref: collection.MESSAGE,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Kiểu dữ liệu cho AttachmentDocument
export interface AttachmentDocument extends Document {
  attachment_type: string // Loại file đính kèm:  image, video, audio, document
  file_url: string
  message_id: MessageDocument['_id']
  created_at: Date
}

// Tạo model cho Attachment
export const Attachment = model<AttachmentDocument>(collection.ATTACHMENT, AttachmentSchema)
