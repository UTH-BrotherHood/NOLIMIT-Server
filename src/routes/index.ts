import { Router } from 'express'
import usersRouter from '~/routes/users.routes'

const rootRouterV1 = Router()
rootRouterV1.use('/user', usersRouter)

export default rootRouterV1
