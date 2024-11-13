import { Router } from 'express'
import { addParticipantController, createParticipantController } from '~/controllers/participants.controller'
import { addParticipantValidation } from '~/middlewares/participants.middleware'
import { accessTokenValidation } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const participantsRouters = Router()

/*
Description: This route is used to create new participants for a conversation or group
Method: POST
Body: { "conversation_id": "string", "user_id": "string" }
Path: /participants/
*/
participantsRouters.post('/', accessTokenValidation, addParticipantValidation, wrapRequestHandler(createParticipantController))

/*
Description: This route is used to add participants to group
Method: PUT
Body: { "conversation_id": "string", "user_id": "string"}
Path: /participants/add-to-group
 */
participantsRouters.put('/add-to-group', accessTokenValidation, addParticipantValidation, wrapRequestHandler(addParticipantController))

export default participantsRouters  