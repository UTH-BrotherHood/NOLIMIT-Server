import { Router } from 'express'
import usersRouter from '~/routes/users.routes'
import conversationsRouter from '~/routes/conversations.routes'
import groupsRouter from '~/routes/groups.routes'
import participantsRouters from '~/routes/participants.routes'
import messagesRouter from '~/routes/messages.routes'
import tasksRouter from './tasks.routes'
import { pushToLogDiscord } from '~/middlewares/logDiscord.middleware'

const rootRouterV1 = Router()
rootRouterV1.use(pushToLogDiscord)
rootRouterV1.use('/user', usersRouter)
rootRouterV1.use('/conversation', conversationsRouter)
rootRouterV1.use('/group', groupsRouter)
rootRouterV1.use('/participant', participantsRouters)
rootRouterV1.use('/messages', messagesRouter)
rootRouterV1.use('/task', tasksRouter)

export default rootRouterV1
