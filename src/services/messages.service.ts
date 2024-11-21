import HTTP_STATUS from "~/constants/httpStatus";
import databaseServices from "./database.service";
import { CONVERSATION_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/utils/errors";
import { ObjectId } from "mongodb";
import { socketService } from "~/services/socket.service";

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
        const message = await databaseServices.messages.findOne({ _id: new ObjectId(messageId) } as any)

        if (!message) {
            throw new ErrorWithStatus({
                message: CONVERSATION_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            })
        }

        const result = await databaseServices.messages.updateOne(
            {
                _id: new ObjectId(messageId) as any,
                read_by: { $ne: new ObjectId(user_id) }
            },
            {
                $set: { is_read: true },
                $push: { read_by: new ObjectId(user_id) }
            }
        )

        const senderId = message.sender_id.toString()
        
        socketService.emitToUser(
            senderId,
            'message_read',
            {
                message_id: messageId,
                reader_id: user_id
            }
        )

        return result
    }
}

export const messagesService = new MessagesService();