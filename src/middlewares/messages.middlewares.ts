import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import databaseServices from '~/services/database.service';
import { ErrorWithStatus } from '~/utils/errors';
import { TokenPayload } from '~/models/requests/users.requests';
import HTTP_STATUS from '~/constants/httpStatus';

// Middleware kiểm tra xem người dùng có quyền xóa tin nhắn không (chủ sở hữu tin nhắn)
export const verifyMessageOwnership = async (req: Request, res: Response, next: NextFunction) => {
    const messageId = req.params.messageId;
    const { user_id } = req.decoded_authorization as TokenPayload;

    const message = await databaseServices.messages.findOne({ _id: new ObjectId(messageId) } as any);

    if (!message) {
        throw new ErrorWithStatus({
            message: 'Message not found',
            status: HTTP_STATUS.NOT_FOUND
        });
    }

    // Kiểm tra xem người dùng có phải là người gửi không
    if (message.sender_id.toString() !== user_id) {
        throw new ErrorWithStatus({
            message: 'Access denied',
            status: HTTP_STATUS.FORBIDDEN
        });
    }

    next();
};

export const verifyUserConversationAccess = async (req: Request, res: Response, next: NextFunction) => {
    const { messageId } = req.params;
    const { user_id } = req.decoded_authorization as TokenPayload;

    // Fetch the message from the database
    const message = await databaseServices.messages.findOne({ _id: new ObjectId(messageId) } as any);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is part of the conversation
    const conversation = await databaseServices.conversations.findOne({ _id: message.conversation_id } as any);

    // Kiểm tra nếu người dùng là participant của cuộc trò chuyện
    const participant = await databaseServices.participants.findOne({
        reference_id: new ObjectId(conversation?._id),
        user_id: new ObjectId(user_id),
        status: 'active'
    });

    if (!participant) {
        throw new ErrorWithStatus({
            message: 'Access denied',
            status: HTTP_STATUS.FORBIDDEN
        });
    }

    // User has access, proceed to the next middleware
    next();
}
