import { Attachment } from "~/models/schemas/attachment.schema"
import databaseServices from "./database.service"

class AttachmentService {
    async createAttachment({ attachment_type, file_url }: { attachment_type: string; file_url: string }) {
        const actualType = attachment_type === "voice" ? "audio" : attachment_type; // Nếu là voice, chuyển thành audio
        return await Attachment.create({
            attachment_type: actualType,
            file_url,
        });
        // return await databaseServices.attachments.insertOne(attachment)
    }
}

export const attachmentService = new AttachmentService()