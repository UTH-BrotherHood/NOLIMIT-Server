import { Router } from 'express'
import { createOneToOneConversationController, createPrivateGroupController, deleteConversationController, getConversationByIdController, getConversationsController } from '~/controllers/conversation.controller';
import { checkUserConversations, createOneToOneConversationValidation, createPrivateGroupValidation, verifyDeleteConversationPermission, verifyUserConversationAccess } from '~/middlewares/conversations.middleware';
import { accessTokenValidation } from '~/middlewares/users.middleware';
import { wrapRequestHandler } from '~/utils/handlers';


const conversationsRouter = Router();


/*
Description: This route is used to get all conversations of the user
Path: /conversation/
Method: GET
*/
conversationsRouter.get('/', accessTokenValidation, wrapRequestHandler(checkUserConversations), wrapRequestHandler(getConversationsController))



/*
Description: This route is used to create a new 1 - 1 conversation
Path: /conversation
Method: POST
Body: {
    participants: [String],
    is_group: Boolean, // false
    }
*/
conversationsRouter.post('/', accessTokenValidation, createOneToOneConversationValidation, wrapRequestHandler(createOneToOneConversationController))

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
conversationsRouter.post('/group', accessTokenValidation, createPrivateGroupValidation, wrapRequestHandler(createPrivateGroupController));

/*
Description: This route is used to get a specific conversation by its ID
Path: /conversation/:conversationId
Method: GET
Params: conversationId
Middleware: accessTokenValidation, verifyUserConversationAccess
*/
conversationsRouter.get('/:conversationId', accessTokenValidation, wrapRequestHandler(verifyUserConversationAccess), wrapRequestHandler(getConversationByIdController))

/*
Description: This route is used to delete a conversation
Path: /conversation/:conversationId
Method: DELETE
Params: conversationId
Middleware: accessTokenValidation, verifyDeleteConversationPermission
*/
conversationsRouter.delete('/:conversationId', accessTokenValidation, wrapRequestHandler(verifyUserConversationAccess), wrapRequestHandler(verifyDeleteConversationPermission), wrapRequestHandler(deleteConversationController))

export default conversationsRouter;



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
