import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus';
import { CONVERSATION_MESSAGES } from '~/constants/messages';
import { TokenPayload } from '~/models/requests/users.requests';
import { messagesService } from '~/services/messages.service';

export const deleteMessageController = async (req: Request<ParamsDictionary>, res: Response) => {
    const { messageId } = req.params;
    const result = await messagesService.deleteMessage(messageId);

    return res.status(
        HTTP_STATUS.OK
    ).json({
        message: CONVERSATION_MESSAGES.DELETE_MESSAGE_SUCCESSFULLY,
    });
}

export const markMessageAsReadController = async (req: Request<ParamsDictionary>, res: Response) => {
    const { messageId } = req.params;
    const { user_id } = req.decoded_authorization as TokenPayload;
    const result = await messagesService.markMessageAsRead(user_id, messageId);

    return res.status(
        HTTP_STATUS.OK
    ).json({
        message: CONVERSATION_MESSAGES.MARK_MESSAGE_AS_READ_SUCCESSFULLY,
    });
}