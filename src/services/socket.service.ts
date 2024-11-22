import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

interface MessageData {
  conversation_id: string
  message: any
}

class SocketService {
  private io!: Server
  private userSockets: Map<string, string[]>

  constructor() {
    this.userSockets = new Map()
  }

  public initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    })

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('user_connected', (userId: string) => {
        console.log(`User ${userId} connected with socket ${socket.id}`)

        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, [])
        }

        const userSocketIds = this.userSockets.get(userId)
        if (userSocketIds && !userSocketIds.includes(socket.id)) {
          userSocketIds.push(socket.id)
          this.userSockets.set(userId, userSocketIds)
        }

        console.log(`Current sockets for user ${userId}:`, this.userSockets.get(userId))
      })

      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId)
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
      })

      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId)
        console.log(`Socket ${socket.id} left conversation ${conversationId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)

        this.userSockets.forEach((socketIds, userId) => {
          const updatedSocketIds = socketIds.filter((id) => id !== socket.id)
          if (updatedSocketIds.length === 0) {
            this.userSockets.delete(userId)
          } else {
            this.userSockets.set(userId, updatedSocketIds)
          }
        })
      })
    })
  }

  public emitNewMessage(data: MessageData) {
    console.log('Emitting new message to conversation:', data.conversation_id)
    this.io.to(data.conversation_id).emit('new_message', data)
  }

  public emitToUser(userId: string, event: string, data: any) {
    console.log('Emitting to user:', userId)
    const userSocketIds = this.userSockets.get(userId)
    console.log('User socket IDs:', userSocketIds)

    if (userSocketIds && userSocketIds.length > 0) {
      userSocketIds.forEach((socketId) => {
        console.log('Emitting to socket:', socketId)
        this.io.to(socketId).emit(event, data)
      })
    } else {
      console.log('No active sockets found for user', userId)
    }
  }

  public emitToRoom(conversationId: string, event: string, data: any) {
    console.log('Emitting to room:', conversationId)
    this.io.to(conversationId).emit(event, data)
  }

  public getUserSockets() {
    return this.userSockets
  }
}

export const socketService = new SocketService()
