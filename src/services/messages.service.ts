import HTTP_STATUS from "~/constants/httpStatus";
import databaseServices from "./database.service";
import { CONVERSATION_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/utils/errors";
import { ObjectId } from "mongodb";

class MessagesService {
    async deleteMessage(messageId: string) {
        const result = await databaseServices.messages.deleteOne({ _id: new ObjectId(messageId) } as any);

        if (result.deletedCount === 0) {
            throw new ErrorWithStatus({
                message: CONVERSATION_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        return result;

    }

    async markMessageAsRead(user_id: string, messageId: string) {
        // kiểm tra xem message có tồn tại không
        const message = await databaseServices.messages.findOne({ _id: new ObjectId(messageId) } as any);

        if (!message) {
            throw new ErrorWithStatus({
                message: CONVERSATION_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        // Cập nhật tin nhắn: đánh dấu là đã đọc và thêm user vào danh sách read_by nếu chưa có
        const result = await databaseServices.messages.updateOne(
            {
                _id: new ObjectId(messageId) as any,
                // 'read_by.user_id': { $ne: user_id }
                read_by: { $ne: new ObjectId(user_id) }
            },
            // {
            //     $push: {
            //         read_by: {
            //             user_id,
            //             read_at: new Date()
            //         }
            //     }
            // } as any
            {
                $set: { is_read: true },
                $push: { read_by: new ObjectId(user_id) }
            }
        );

        // if (result.matchedCount === 0) {
        //     throw new ErrorWithStatus({
        //         message: CONVERSATION_MESSAGES.MESSAGE_ALREADY_READ,
        //         status: HTTP_STATUS.OK
        //     });
        // }

        return result;
    }
}

export const messagesService = new MessagesService();