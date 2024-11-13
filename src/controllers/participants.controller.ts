import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PARTICIPANTS_MESSAGES } from '~/constants/messages'
import { AddParticipantReqBody } from '~/models/requests/participants.requests'
import participantsService from '~/services/participants.service'

export const createParticipantController = async (req: Request<ParamsDictionary, any, AddParticipantReqBody>, res: Response) => {
    const result = await participantsService.createParticipant(req.body)
    return res.status(
        HTTP_STATUS.CREATED
    ).json({
        message: PARTICIPANTS_MESSAGES.CREATE_PARTICIPANT_SUCCESSFULLY,
        data: result
    })
}

export const addParticipantController = async (req: Request<ParamsDictionary, any, AddParticipantReqBody>, res: Response) => {
    const result = await participantsService.addParticipant(req.body)
    return res.status(
        HTTP_STATUS.OK
    ).json({
        message: PARTICIPANTS_MESSAGES.ADD_PARTICIPANT_SUCCESSFULLY,
        data: result
    })
}