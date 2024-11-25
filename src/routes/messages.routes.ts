import { Router } from 'express'
import { wrapRequestHandler } from '~/utils/handlers';
import { accessTokenValidation } from '~/middlewares/users.middleware';
import { verifyMessageOwnership } from '~/middlewares/messages.middlewares';
import { deleteMessageController, markMessageAsReadController } from '~/controllers/message.controller';
import { verifyUserConversationAccess } from '~/middlewares/messages.middlewares';

const messagesRouter = Router();

/*
Description: This route is used to update a message
Path: /messages/:messageId
Method: PUT
Params: messageId
Body: {
    content: String
}
*/

/*
Description: This route is used to delete a message
Path: /messages/:messageId
Method: DELETE
Params: messageId
Middleware: accessTokenValidation, verifyMessageOwnership
*/
messagesRouter.delete('/:messageId', accessTokenValidation, wrapRequestHandler(verifyMessageOwnership), wrapRequestHandler(deleteMessageController))

/*
Description: This route is used to mark a message as read
Path: /messages/:messageId/read
Method: PUT
Params: messageId
Middleware: accessTokenValidation,verifyUserConversationAccess(phải có quyền truy cập vào cuộc trò chuyện)
*/
// khi người dùng mở cuộc trò chuyện, thì tất cả các tin nhắn trong cuộc trò chuyện đó sẽ được đánh dấu là đã đọc
messagesRouter.put('/:messageId/read', accessTokenValidation, wrapRequestHandler(verifyUserConversationAccess), wrapRequestHandler(markMessageAsReadController))


export default messagesRouter