import express from 'express'
import { createServer } from 'http'
import { envConfig } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/errors.middleware'
import rootRouterV1 from '~/routes'
import databaseServices from '~/services/database.service'
import cors from 'cors'
import passport from "passport"
import "~/utils/passport"
import { socketService } from './services/socket.service'
import rateLimiterMiddleware from './middlewares/rateLimiter.middleware'

const app = express()
const httpServer = createServer(app)

// Khởi tạo socket service
socketService.initialize(httpServer)

databaseServices.connect()

app.use(cors())
app.use(passport.initialize())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1', rootRouterV1)
// Route cụ thể áp dụng rate limiter
app.get('/api/test', rateLimiterMiddleware, (req, res) => {
  res.send({ message: 'Request success!' });
});

// Route không áp dụng rate limiter
app.get('/api/nolimit', (req, res) => {
  res.send({ message: 'This route has no rate limit' });
});

app.use(defaultErrorHandler)

httpServer.listen(envConfig.port, () => {
  console.log(`Server is running on port ${envConfig.port}`)
})
