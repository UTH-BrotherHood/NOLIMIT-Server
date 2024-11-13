import { Router } from 'express'
import usersRouter from '~/routes/users.routes'
import conversationsRouter from '~/routes/conversations.routes'
import groupsRouter from '~/routes/groups.routes'
import participantsRouters from '~/routes/participants.routes'

const rootRouterV1 = Router()
rootRouterV1.use('/user', usersRouter)
rootRouterV1.use('/conversation', conversationsRouter)
rootRouterV1.use('/group', groupsRouter)
rootRouterV1.use('/participant', participantsRouters)

export default rootRouterV1
