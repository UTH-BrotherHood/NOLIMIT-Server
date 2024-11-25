import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { MessageDocument } from '~/models/schemas/message.schema'
import { AttachmentDocument } from '~/models/schemas/attachment.schema'

// bảng này lưu thông tin về các file đính kèm trong 1 tin nhắn (sử dụng trong trường hợp tin nhắn có nhiều file đính kèm)
const MessageAttachmentSchema = new Schema({
  message_id: {
    type: Schema.Types.ObjectId,
    ref: collection.MESSAGE,
    required: true
  },
  attachment_id: {
    type: Schema.Types.ObjectId,
    ref: collection.ATTACHMENT,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Kiểu dữ liệu cho MessageAttachmentDocument
export interface MessageAttachmentDocument extends Document {
  message_id: MessageDocument['_id']
  attachment_id: AttachmentDocument['_id']
  created_at: Date
}

// Tạo model cho MessageAttachment
export const MessageAttachment = model<MessageAttachmentDocument>(
  collection.MESSAGE_ATTACHMENT,
  MessageAttachmentSchema
)
