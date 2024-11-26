import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONVERSATION_MESSAGES } from '~/constants/messages'
import { ConversationGroupReqBody, ConversationOneToOneReqBody } from '~/models/requests/conversations.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { attachmentService } from '~/services/attachment.service'
import { conversationsService } from '~/services/conversations.service'
import { Attachment } from '~/models/schemas/attachment.schema'
import databaseServices from '~/services/database.service'

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
  const avatar_url = req.fileUrl || ""
  const result = await conversationsService.createPrivateGroup(user_id, {
    ...body,
    avatar_url,
  });
  return res.status(HTTP_STATUS.CREATED).json({
    message: CONVERSATION_MESSAGES.CREATE_CONVERSATION_SUCCESSFULLY,
    data: result
  })
}

export const getConversationByIdController = async (req: Request<ParamsDictionary>, res: Response) => {
  const { conversationId } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await conversationsService.getConversationById(conversationId, user_id)
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
  req: Request<ParamsDictionary>,
  res: Response
) => {
  const { conversationId } = req.params
  const { message_content, message_type, sticker_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload

  let result
  if (message_type === "text") {
    result = await conversationsService.createMessage({
      conversation_id: conversationId,
      sender_id: user_id,
      message_type,
      message_content,
    });
  } else if (message_type === "sticker") {
    result = await conversationsService.createMessage({
      conversation_id: conversationId,
      sender_id: user_id,
      message_type,
      sticker_id,
    });
  }


  if (["image", "video", "file", "voice"].includes(message_type)) {
    if (!req.fileUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No file uploaded" });
    }

    // Tạo file đính kèm
    const attachment = await attachmentService.createAttachment({
      attachment_type: message_type === "voice" ? "audio" : message_type, // Nếu là voice, gắn loại "audio"
      file_url: req.fileUrl
    });

    if (!attachment || !attachment.insertedId) {
      throw new Error("Attachment creation failed");
    }

    // Tạo tin nhắn
    result = await conversationsService.createMessage({ conversation_id: conversationId, sender_id: user_id, message_type, message_content });

    if (!result || !result._id) {
      throw new Error("Message creation failed");
    }

    // Liên kết Attachment với Message
    await conversationsService.linkAttachmentToMessage({
      attachmentId: attachment.insertedId.toString(),
      messageId: result._id.toString(),
    });
  }

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