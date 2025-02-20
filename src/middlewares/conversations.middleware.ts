import { checkSchema } from "express-validator";
import { TokenPayload } from "~/models/requests/users.requests";
import { validate } from "~/utils/validation.utils";
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import databaseServices from "~/services/database.service";
import HTTP_STATUS from "~/constants/httpStatus";
import { CONVERSATION_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/utils/errors";


export const createOneToOneConversationValidation = validate(
    checkSchema({
        is_group: {
            isBoolean: {
                errorMessage: 'is_group must be a boolean',
            },
            toBoolean: true,
            custom: {
                options: (value) => value === false,
                errorMessage: 'is_group must be false for 1-1 conversations',
            },
        },
        participants: {
            isArray: {
                errorMessage: 'participants must be an array',
            },
            custom: {
                options: (value) => value.length === 2,
                errorMessage: '1-1 conversation must have exactly 2 participants',
            },
        },
        'participants.*': {
            isString: {
                errorMessage: 'Each participant must be a valid user ID',
            },
            notEmpty: {
                errorMessage: 'Each participant ID cannot be empty',
            },
        },
    },
        ['body']
    )
);

export const createPrivateGroupValidation = validate(
    checkSchema({
        is_group: {
            isBoolean: {
                errorMessage: 'is_group must be a boolean',
            },
            toBoolean: true,
            custom: {
                options: (value) => value === true,
                errorMessage: 'is_group must be true for group conversations',
            },
        },
        participants: {
            isArray: {
                errorMessage: 'participants must be an array',
            },
            custom: {
                options: (value) => value.length >= 2,
                errorMessage: 'Group conversation must have at least 2 participants',
            },
        },
        'participants.*': {
            isString: {
                errorMessage: 'Each participant must be a valid user ID',
            },
            notEmpty: {
                errorMessage: 'Each participant ID cannot be empty',
            },
        },
        conversation_name: {
            isString: {
                errorMessage: 'conversation_name must be a string',
            },
            notEmpty: {
                errorMessage: 'conversation_name cannot be empty',
            },
        },

        announcement: {
            optional: true,
            isString: {
                errorMessage: 'announcement must be a string',
            },
        },

        avatar: {
            custom: {
                options: (value, { req }) => {
                    const { file_type } = req.body;
                    if (['image'].includes(file_type) && !req.file) {
                        throw new Error(`File is required for ${file_type} messages`);
                    }

                    return true;
                },
            },
        }
    },
        ['body']
    )
);

// Middleware checkUserConversations kiểm tra xem người dùng có tham gia bất kỳ cuộc trò chuyện nào hay không.
export const checkUserConversations = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload;

    // Kiểm tra nếu người dùng tồn tại trong bảng participants
    const userExists = await databaseServices.participants.findOne({ user_id: new ObjectId(user_id) });

    if (!userExists) {
        throw new ErrorWithStatus({
            message: CONVERSATION_MESSAGES.USER_NOT_IN_CONVERSATION,
            status: HTTP_STATUS.NOT_FOUND
        });
    }

    next();

};

// Middleware checkConversationExist kiểm tra cuộc trò chuyện có tồn tại không.
export const checkConversationExist = async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.conversationId;

    // Kiểm tra nếu cuộc trò chuyện tồn tại
    const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversationId) } as any);

    if (!conversation) {
        throw new ErrorWithStatus({
            message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
        });
    }

    req.conversation = conversation;

    next();

};

// Middleware authorizedConversationAccess kiểm tra xem người dùng có quyền truy cập vào cuộc trò chuyện không.
export const verifyUserConversationAccess = async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.conversationId;
    const { user_id } = req.decoded_authorization as TokenPayload;

    // Kiểm tra nếu người dùng là participant của cuộc trò chuyện
    const participant = await databaseServices.participants.findOne({
        reference_id: new ObjectId(conversationId),
        user_id: new ObjectId(user_id),
        status: 'active'
    });

    if (!participant) {
        throw new ErrorWithStatus({
            message: 'Access denied',
            status: HTTP_STATUS.FORBIDDEN
        });
    }

    next();

};

// Middleware verifyUserIsCreator kiểm tra xem người dùng có phải là creator của cuộc trò chuyện không.
export const verifyUserIsCreator = async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.conversationId;
    const { user_id } = req.decoded_authorization as TokenPayload;

    // Kiểm tra nếu người dùng là creator của cuộc trò chuyện
    const conversation = await databaseServices.conversations.findOne({
        _id: new ObjectId(conversationId) as any,
        creator: new ObjectId(user_id)
    });

    if (!conversation) {
        throw new ErrorWithStatus({
            message: 'Only the creator can modify or delete this conversation',
            status: HTTP_STATUS.FORBIDDEN
        });
    }

    req.conversation = conversation; // Lưu thông tin cuộc trò chuyện để dùng ở controller nếu cần
    next();
};

// Middleware verifyDeleteConversationPermission kiểm tra xem người dùng có quyền xóa cuộc trò chuyện không.
export const verifyDeleteConversationPermission = async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.conversationId;
    const { user_id } = req.decoded_authorization as TokenPayload;

    // Tìm cuộc trò chuyện
    const conversation = await databaseServices.conversations.findOne({
        _id: new ObjectId(conversationId) as any
    });

    if (!conversation) {
        throw new ErrorWithStatus({
            message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
        });
    }

    // Kiểm tra nếu là cuộc trò chuyện 1-1
    if (!conversation.is_group) {
        // Nếu là cuộc trò chuyện 1-1, bất kỳ người tham gia nào cũng có thể xóa

        req.conversation = conversation; // Lưu thông tin cuộc trò chuyện để dùng trong controller nếu cần
        return next();
    }

    // Nếu là cuộc trò chuyện nhóm, kiểm tra role của người dùng
    const participant = await databaseServices.participants.findOne({
        reference_id: new ObjectId(conversationId),
        user_id: new ObjectId(user_id),
        type: 'group'
    });

    if (!participant) {
        throw new ErrorWithStatus({
            message: 'User is not a participant in this conversation',
            status: HTTP_STATUS.FORBIDDEN
        });
    }

    // Chỉ cho phép admin xóa nhóm
    if (conversation.is_group && participant.role !== 'admin') {
        throw new ErrorWithStatus({
            message: 'Only an admin can delete this group conversation',
            status: HTTP_STATUS.FORBIDDEN
        });
    }

    // Nếu điều kiện được thỏa mãn, tiếp tục đến controller xóa cuộc trò chuyện
    req.conversation = conversation; // Lưu thông tin cuộc trò chuyện để dùng trong controller nếu cần
    next();
};

export const messageContentValidation = validate(
    checkSchema({
        message_type: {
            optional: true,
            isString: {
                errorMessage: 'message_type must be a string',
            },
            isIn: {
                options: [['text', 'sticker', 'image', 'video', 'voice', 'file', 'code', 'inviteV2', 'system']],
                errorMessage: 'Invalid message type',
            },
            trim: true,
            notEmpty: {
                errorMessage: 'message_type is required',
            },
            custom: {
                options: (value) => {
                    const trimmedValue = value.trim();
                    if (!['text', 'image', 'sticker', 'video', 'file', 'voice', 'code', 'inviteV2', 'system'].includes(trimmedValue)) {
                        throw new Error('Invalid message type');
                    }
                    return true;
                },
            },
        },

        message_content: {
            optional: true,
            isString: {
                errorMessage: 'message_content must be a string',
            },
            custom: {
                options: (value, { req }) => {
                    const { message_type } = req.body;
                    if (message_type === 'text' && (!value || value.trim() === '')) {
                        throw new Error('message_content must be a non-empty string when message_type is not image, video, or file');
                    }
                    return true;
                }
            }
        },

        sticker_id: {
            optional: true,
            isMongoId: {
                errorMessage: 'sticker_id must be a valid Mongo ID',
            },
            custom: {
                options: (value, { req }) => {
                    if (req.body.message_type === 'sticker' && !value) {
                        throw new Error('sticker_id is required for sticker messages');
                    }
                    return true;
                },
            },
        },

        file: {
            custom: {
                options: (value, { req }) => {
                    const { message_type } = req.body;
                    // Kiểm tra loại tin nhắn là hình ảnh, video hoặc file và có tệp đính kèm không
                    if (['image', 'video', 'file', 'voice'].includes(message_type) && !req.file) {
                        throw new Error(`File is required for ${message_type} messages`);
                    }

                    return true;
                },
            },
        }
    },
        ['body'])
);


