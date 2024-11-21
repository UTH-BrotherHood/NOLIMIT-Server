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
        origin: '*'
      }
    })

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

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
      })
    })
  }

  public emitNewMessage(data: MessageData) {
    this.io.to(data.conversation_id).emit('new_message', data)
  }

  public emitToUser(userId: string, event: string, data: any) {
    if (!this.io) {
      console.error('Socket.IO has not been initialized')
      return
    }

    console.log('Current connected users:', Array.from(this.userSockets.keys()))
    console.log('Emitting to user:', userId)
    console.log('User socket IDs:', this.userSockets.get(userId))

    const socketIds = this.userSockets.get(userId)
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.io?.to(socketId).emit(event, data)
      })
    } else {
      console.log(`No active sockets found for user ${userId}`)
    }
  }

  public emitToRoom(conversationId: string, event: string, data: any) {
    this.io.to(conversationId).emit(event, data)
  }
}

export const socketService = new SocketService()
