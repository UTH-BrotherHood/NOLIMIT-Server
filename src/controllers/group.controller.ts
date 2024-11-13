import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { GROUP_MESSAGES } from '~/constants/messages'
import { CreateGroupReqBody } from '~/models/requests/groups.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import groupsService from '~/services/groups.service'

export const createGroupController = async (req: Request<ParamsDictionary, any, CreateGroupReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { body } = req
    const result = await groupsService.createGroup(user_id, body)
    return res.status(
        HTTP_STATUS.CREATED
    ).json({
        message: GROUP_MESSAGES.CREATE_GROUP_SUCCESSFULLY,
        data: result
    })
}