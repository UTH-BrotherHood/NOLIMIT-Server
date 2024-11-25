import { Router } from 'express'
import {
    createMessageController,
    createOneToOneConversationController,
    createPrivateGroupController,
    deleteConversationController,
    getConversationByIdController,
    getConversationsController,
    getLastMessageSeenStatusController,
    getMessagesController
} from '~/controllers/conversation.controller'
import { uploadMiddleware } from '~/middlewares/upload.middlware'
import {
    checkUserConversations,
    createOneToOneConversationValidation,
    createPrivateGroupValidation,
    messageContentValidation,
    verifyDeleteConversationPermission,
    verifyUserConversationAccess
} from '~/middlewares/conversations.middleware'
import { accessTokenValidation } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
import upload from '~/config/multer'

const conversationsRouter = Router()

/*
Description: This route is used to get all conversations of the user
Path: /conversation/
Method: GET
*/
conversationsRouter.get(
    '/',
    accessTokenValidation,
    wrapRequestHandler(checkUserConversations),
    wrapRequestHandler(getConversationsController)
)

/*
Description: This route is used to create a new 1 - 1 conversation
Path: /conversation
Method: POST
Body: {
    participants: [String],
    is_group: Boolean, // false
    }
*/
conversationsRouter.post(
    '/',
    accessTokenValidation,
    createOneToOneConversationValidation,
    wrapRequestHandler(createOneToOneConversationController)
)

/*
Description: This route is used to create a new group conversation
Path: /conversation/group
Method: POST
Body: {
    participants: [String],
    conversation_name: String
    is_group: Boolean, // true
    }
*/
conversationsRouter.post(
    '/group',
    accessTokenValidation,
    upload.single('avatar'),
    wrapRequestHandler(uploadMiddleware),
    createPrivateGroupValidation,
    wrapRequestHandler(createPrivateGroupController)
)

/*
Description: This route is used to get a specific conversation by its ID
Path: /conversation/:conversationId
Method: GET
Params: conversationId
Middleware: accessTokenValidation, verifyUserConversationAccess
*/
conversationsRouter.get(
    '/:conversationId',
    accessTokenValidation,
    wrapRequestHandler(verifyUserConversationAccess),
    wrapRequestHandler(getConversationByIdController)
)

/*
Description: This route is used to delete a conversation
Path: /conversation/:conversationId
Method: DELETE
Params: conversationId
Middleware: accessTokenValidation, verifyDeleteConversationPermission
*/
conversationsRouter.delete(
    '/:conversationId',
    accessTokenValidation,
    wrapRequestHandler(verifyUserConversationAccess),
    wrapRequestHandler(verifyDeleteConversationPermission),
    wrapRequestHandler(deleteConversationController)
)

/*
Description: This route is used to get all messages of a conversation (with pagination): mỗi lần lấy 10 messages mới nhất
Path: /conversation/:conversationId/messages
Method: GET
Params: conversationId
Query: lastMessageId (tùy chọn): ID của tin nhắn cuối cùng mà người dùng đã đọc. Nếu không có lastMessageId, API sẽ trả về 10 tin nhắn mới nhất.
Middleware: accessTokenValidation, verifyUserConversationAccess
*/
// mới thêm checkConversationExist vào middleware, chưa áp dụng với mấy route ở trên
conversationsRouter.get(
    '/:conversationId/messages',
    accessTokenValidation,
    wrapRequestHandler(verifyUserConversationAccess),
    wrapRequestHandler(getMessagesController)
)

/*
Description: This route is used to create a new message in a conversation
Path: /conversation/:conversationId/messages
Method: POST
Params: conversationId
Body: {
    message_content: String,
    message_type: String // text, image, file, code, inviteV2, system
}
Middleware: accessTokenValidation, verifyUserConversationAccess, messageContentValidation, uploadToCloudinaryMiddleware (nếu message_type là image hoặc file)
*/
// conversationsRouter.post('/:conversationId/messages', accessTokenValidation, wrapRequestHandler(verifyUserConversationAccess), uploadFile.single("file"), messageContentValidation, wrapRequestHandler(uploadToCloudinaryMiddleware), wrapRequestHandler(createMessageController))

conversationsRouter.post(
    '/:conversationId/messages',
    accessTokenValidation,
    wrapRequestHandler(verifyUserConversationAccess),
    upload.single('file'),
    wrapRequestHandler(uploadMiddleware),
    wrapRequestHandler(messageContentValidation),
    wrapRequestHandler(createMessageController)
)

/*
Description: This route is used to display the "Seen" status for the last message in a conversation
Path: /conversation/:conversationId/last-message-seen
Method: GET
Params: conversationId
Middleware: accessTokenValidation, verifyUserConversationAccess
*/
conversationsRouter.get(
    '/:conversationId/last-message-seen',
    accessTokenValidation,
    wrapRequestHandler(verifyUserConversationAccess),
    wrapRequestHandler(getLastMessageSeenStatusController)
)

export default conversationsRouter

// /*
// Description: This route is used to update a conversation
// Path: /conversation/:conversationId
// Method: PUT
// Params: conversationId
// Body: {
//     conversation_name?: String,
//     participants?: [String],
//     is_group?: Boolean,
//     }
// Middleware: accessTokenValidation, authorizedConversationAccess
// */
// conversationsRouter.put('/:conversationId', accessTokenValidation, authorizedConversationAccess, wrapRequestHandler(updateConversationController))
