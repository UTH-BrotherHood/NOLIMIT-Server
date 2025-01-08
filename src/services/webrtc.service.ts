import { Server } from 'socket.io'

class WebRTCService {
  private io!: Server

  constructor(io: Server) {
    this.io = io
  }

  public initialize() {
    this.io.on('connection', (socket) => {
      console.log('Client connected to WebRTC signaling:', socket.id)

      // Lắng nghe offer và phát lại cho client khác
      socket.on('offer', (offer: any) => {
        console.log('Received offer:', offer)
        socket.broadcast.emit('offer', offer) // Phát offer cho các client khác
      })

      // Lắng nghe answer và phát lại cho client
      socket.on('answer', (answer: any) => {
        console.log('Received answer:', answer)
        socket.broadcast.emit('answer', answer) // Phát answer cho các client khác
      })

      // Lắng nghe ICE candidate và phát lại cho client khác
      socket.on('ice-candidate', (candidate: any) => {
        console.log('Received ICE candidate:', candidate)
        socket.broadcast.emit('ice-candidate', candidate) // Phát ICE candidate cho các client khác
      })

      socket.on('disconnect', () => {
        console.log('WebRTC Client disconnected:', socket.id)
      })
    })
  }
}

export default WebRTCService
