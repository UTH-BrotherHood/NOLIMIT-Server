import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONVERSATION_MESSAGES } from '~/constants/messages'
import { ConversationGroupReqBody, ConversationOneToOneReqBody } from '~/models/requests/conversations.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { conversationsService } from '~/services/conversations.service'

export const getConversationsController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await conversationsService.getConversations(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY,
    data: result
  })
}

export const createOneToOneConversationController = async (
  req: Request<ParamsDictionary, any, ConversationOneToOneReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await conversationsService.createOneToOneConversation(user_id, body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: CONVERSATION_MESSAGES.CREATE_CONVERSATION_SUCCESSFULLY,
    data: result
  })
}

export const createPrivateGroupController = async (
  req: Request<ParamsDictionary, any, ConversationGroupReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await conversationsService.createPrivateGroup(user_id, body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: CONVERSATION_MESSAGES.CREATE_CONVERSATION_SUCCESSFULLY,
    data: result
  })
}

export const getConversationByIdController = async (req: Request<ParamsDictionary>, res: Response) => {
  const { conversationId } = req.params
  const result = await conversationsService.getConversationById(conversationId)
  return res.status(HTTP_STATUS.OK).json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATION_SUCCESSFULLY,
    data: result
  })
}

export const deleteConversationController = async (req: Request, res: Response) => {
  await conversationsService.deleteConversation(req.conversation)
  return res.status(HTTP_STATUS.OK).json({
    message: CONVERSATION_MESSAGES.DELETE_CONVERSATION_SUCCESSFULLY
  })
}

export const getMessagesController = async (
  req: Request<ParamsDictionary, any, any, { lastMessageId?: string }>,
  res: Response
) => {
  const { conversationId } = req.params
  const { lastMessageId } = req.query
  const result = await conversationsService.getMessages(conversationId, lastMessageId)
  return res.status(HTTP_STATUS.OK).json({
    message: CONVERSATION_MESSAGES.GET_MESSAGES_SUCCESSFULLY,
    data: result
  })
}

export const createMessageController = async (
  req: Request<ParamsDictionary, any, any, { message_content: string; message_type: string }>,
  res: Response
) => {
  const { conversationId } = req.params
  const { message_content, message_type = 'text' } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await conversationsService.createMessage(conversationId, user_id, message_content, message_type)
  return res.status(HTTP_STATUS.CREATED).json({
    message: CONVERSATION_MESSAGES.CREATE_MESSAGE_SUCCESSFULLY,
    data: result
  })
}

export const getLastMessageSeenStatusController = async (req: Request<ParamsDictionary>, res: Response) => {
  const { conversationId } = req.params
  const result = await conversationsService.getLastMessageSeenStatus(conversationId)
  return res.status(HTTP_STATUS.OK).json({
    message: CONVERSATION_MESSAGES.GET_LAST_MESSAGE_SEEN_STATUS_SUCCESSFULLY,
    data: result
  })
}