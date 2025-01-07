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
import { checkApiKey } from './middlewares/apiKey.middleware'
import { wrapRequestHandler } from './utils/handlers'
import rateLimiterMiddleware from './middlewares/rateLimiter.middleware'
import helmet from 'helmet'
// import compression from 'compression'
import morgan from 'morgan'

const app = express()
const httpServer = createServer(app)

// Khởi tạo socket service
socketService.initialize(httpServer)

databaseServices.connect()

// init middleware
app.use(helmet())
// app.use(compression())
app.use(morgan('dev'))
app.use(cors())
app.use(passport.initialize())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.use(wrapRequestHandler(checkApiKey))
// app.use(rateLimiterMiddleware)

// init route
app.use('/api/v1', rootRouterV1)

// init route test
// // Route cụ thể áp dụng API key
// app.use(wrapRequestHandler(checkApiKey))
// app.get('/api/test-apikey', (req, res) => {
//   res.json({
//     message: 'API key is valid!',
//     apiKey: req.apiKey
//   });
// });
// // Route cụ thể áp dụng rate limiter
// app.get('/api/test', rateLimiterMiddleware, (req, res) => {
//   res.send({ message: 'Request success!' });
// });

// // Route không áp dụng rate limiter
// app.get('/api/nolimit', (req, res) => {
//   res.send({ message: 'This route has no rate limit' });
// });

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'The requested resource was not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// init error handler
app.use(defaultErrorHandler)

httpServer.listen(envConfig.port, () => {
  console.log(`Server is running on port ${envConfig.port}`)
})
