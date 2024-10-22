// import fs from "fs";
import express from 'express'
import { envConfig } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/errors.middleware'
import rootRouterV1 from '~/routes'
import databaseServices from '~/services/database.services'
import cors from 'cors'
import passport from "passport";
import "~/utils/passport";
const app = express()

databaseServices.connect()

app.use(cors())

app.use(passport.initialize());

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', rootRouterV1)

app.use(defaultErrorHandler)

app.listen(envConfig.port, () => {
  console.log(`Server is running on port ${envConfig.port}`)
})
