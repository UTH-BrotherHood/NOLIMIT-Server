import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { messagesService } from './messages.service'

interface MessageData {
  conversation_id: string
  message: any
}

class SocketService {
  private io!: Server
  private userSockets: Map<string, Set<string>> // Sử dụng Set thay vì Array

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
      console.log(`Client connected: ${socket.id}`)

      socket.on('user_connected', (userId: string) => {
        console.log(`User ${userId} connected with socket ${socket.id}`)

        // Sử dụng Set để đảm bảo không có socket trùng
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set())
        }

        const userSocketIds = this.userSockets.get(userId)
        userSocketIds?.add(socket.id) // Thêm socket.id vào Set
        console.log(`Current sockets for user ${userId}:`, [...userSocketIds!])
      })

      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId)
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
      })

      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId)
        console.log(`Socket ${socket.id} left conversation ${conversationId}`)
      })

      socket.on('message_read', async (data: { conversationId: string, messageId: string, userId: string }) => {
        try {
          await messagesService.markMessageAsRead(data.messageId, data.userId);
          this.emitToRoom(data.conversationId, 'message_read_update', { messageId: data.messageId, userId: data.userId })
          console.log(`Message ${data.messageId} marked as read by user ${data.userId} in conversation ${data.conversationId}`)
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      })

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)

        // Xóa socket khỏi userSockets khi client disconnect
        this.userSockets.forEach((socketIds, userId) => {
          socketIds.delete(socket.id)
          if (socketIds.size === 0) {
            this.userSockets.delete(userId)
          }
        })
      })
    })
  }

  public emitNewMessage(data: MessageData) {
    console.log(`Emitting new message to conversation: ${data.conversation_id}`)
    this.io.to(data.conversation_id).emit('new_message', data)
    this.emitUpdatedConversations(data.conversation_id)
  }

  public emitUpdatedConversations(conversationId: string) {
    this.io.to(conversationId).emit('updated_conversations', { conversationId })
    console.log(`Conversation ${conversationId} updated`)
  }

  public emitToUser(userId: string, event: string, data: any) {
    console.log(`Emitting to user: ${userId}`)
    const userSocketIds = this.userSockets.get(userId)

    if (userSocketIds && userSocketIds.size > 0) {
      // Chỉ emit đến các socket còn tồn tại
      userSocketIds.forEach((socketId) => {
        console.log(`Emitting to socket: ${socketId}`)
        this.io.to(socketId).emit(event, data)
      })
    } else {
      console.log(`No active sockets found for user: ${userId}`)
    }
  }

  public emitToRoom(conversationId: string, event: string, data: any) {
    console.log(`Emitting to room: ${conversationId}`)
    this.io.to(conversationId).emit(event, data)
  }

  public getUserSockets() {
    return this.userSockets
  }
}

export const socketService = new SocketService()
