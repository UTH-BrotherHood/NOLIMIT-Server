import { ConversationOneToOneReqBody } from '~/models/requests/conversations.requests'
import databaseServices from './database.service'
import { CONVERSATION_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/utils/errors'
import Conversation from '~/models/schemas/conversation.schema'
import { ObjectId } from 'mongodb'
import Group from '~/models/schemas/group.schema'
import { Message } from '~/models/schemas/message.schema'
import { decrypt, encrypt } from '~/utils/encryption.utils'
import { socketService } from '~/services/socket.service'
import { Attachment } from '~/models/schemas/attachment.schema'

class ConversationsService {
  async createConversation(conversationData: {
    conversation_name: any
    is_group: boolean
    creator: ObjectId
    group_id?: ObjectId
  }) {
    const newConversation = new Conversation(conversationData)
    const result = await databaseServices.conversations.insertOne(newConversation)
    return { _id: result.insertedId, ...conversationData }
  }

  async addParticipantsToConversation(
    conversationId: ObjectId,
    type: string,
    participants: string[],
    creatorId: string
  ) {
    const participantsData = participants.map((userId) => ({
      reference_id: new ObjectId(conversationId),
      type: type as 'conversation' | 'group',
      user_id: new ObjectId(userId),
      role: (type === 'group' && userId === creatorId ? 'admin' : 'member') as 'admin' | 'member',
      status: 'active' as 'active' | 'left' | 'banned',
      joined_at: new Date()
    }))

    await databaseServices.participants.insertMany(participantsData)
  }

  async getConversations(user_id: string) {
    const user_id_object = new ObjectId(user_id)

    // Lấy thông tin cuộc trò chuyện mà user_id tham gia
    const conversations = await databaseServices.participants
      .aggregate([
        {
          $match: {
            user_id: user_id_object
          }
        },
        {
          $lookup: {
            from: 'conversation', // Tên collection `conversations`
            localField: 'reference_id',
            foreignField: '_id',
            as: 'conversationDetails'
          }
        },
        {
          $unwind: '$conversationDetails' // Chuyển mỗi cuộc trò chuyện thành một đối tượng riêng
        },
        {
          $project: {
            _id: '$conversationDetails._id',
            conversation_name: '$conversationDetails.conversation_name',
            is_group: '$conversationDetails.is_group',
            creator: '$conversationDetails.creator',
            created_at: '$conversationDetails.created_at',
            updated_at: '$conversationDetails.updated_at',
            role: '$role'
          }
        }
      ])
      .toArray()

    return conversations
  }

  async createOneToOneConversation(user_id: string, payload: ConversationOneToOneReqBody) {
    const { participants } = payload

    const sortedParticipants = participants.sort()

    // Tìm các participants tương ứng với cuộc trò chuyện 1-1 giữa hai user
    const existingParticipantConversations = await databaseServices.participants
      .aggregate([
        {
          $match: {
            type: 'conversation',
            user_id: { $in: sortedParticipants.map((id) => new ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: '$reference_id',
            participantCount: { $sum: 1 }
          }
        },
        {
          $match: {
            participantCount: 2
          }
        }
      ])
      .toArray()

    // Nếu tìm thấy cuộc trò chuyện 1-1 đã tồn tại
    if (existingParticipantConversations.length > 0) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_ALREADY_EXIST,
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Lấy thông tin của người dùng
    const [currentUser, otherUser] = await Promise.all([
      databaseServices.users.findOne({ _id: new ObjectId(user_id) }),
      databaseServices.users.findOne({ _id: new ObjectId(participants.find((id) => id !== user_id)) })
    ])

    if (!currentUser || !otherUser) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Tạo tên cuộc trò chuyện theo tên người dùng
    const conversationName = {
      [user_id]: otherUser.username,
      [otherUser._id.toString()]: currentUser.username
    }

    // Tạo cuộc trò chuyện 1-1
    const newConversation = await conversationsService.createConversation({
      conversation_name: conversationName,
      is_group: false,
      creator: new ObjectId(user_id)
    })

    // có thể gọi tới ParticipantsService.createParticipant
    await conversationsService.addParticipantsToConversation(newConversation._id, 'conversation', participants, user_id)

    return newConversation
  }

  async createPrivateGroup(user_id: string, payload: any) {
    const { participants, conversation_name, is_group } = payload
    // const currentUserId = user_id;

    // Kiểm tra các user_id có hợp lệ không
    const users = await databaseServices.users
      .find({
        _id: { $in: participants.map((id: string) => new ObjectId(id)) }
      })
      .toArray()

    // Nếu số lượng user_id không bằng số lượng participants thì trả về lỗi
    if (users.length !== participants.length) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Đảm bảo người tạo được thêm vào danh sách thành viên
    if (!participants.includes(user_id)) {
      participants.push(user_id)
    }

    // Tạo nhóm mới
    const newGroup = new Group({
      name: conversation_name,
      creator: new ObjectId(user_id),
      avatar_url: '', // Add appropriate default value
      announcement: '', // Add appropriate default value
      created_at: new Date(),
      updated_at: new Date()
      // Add other required properties with default values
    })
    const result = await databaseServices.groups.insertOne(newGroup)

    // Tạo cuộc trò chuyện nhóm và liên kết với nhóm
    const newConversation = await conversationsService.createConversation({
      conversation_name,
      is_group: true,
      creator: new ObjectId(user_id),
      group_id: result.insertedId
    })

    // Thêm các thành viên vào bảng participants
    await conversationsService.addParticipantsToConversation(newConversation._id, 'group', participants, user_id)

    return newConversation
  }

  async getConversationById(conversationId: string) {
    const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversationId) } as any)

    if (!conversation) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return conversation
  }

  async deleteConversation(conversation: any) {
    await databaseServices.conversations.deleteOne({ _id: conversation._id })
    await databaseServices.participants.deleteMany({ reference_id: conversation._id })
    if (conversation.is_group && conversation.group_id) {
      await databaseServices.groups.deleteOne({ _id: conversation.group_id })
    }
    // await databaseServices.messages.deleteMany({ conversation_id: new ObjectId(conversationId) });
  }

  async createMessage(conversationId: string, sender_id: string, message_content: string, message_type: string) {
    const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversationId) } as any)

    if (!conversation) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const encryptedContent = encrypt(message_content);

    // Nếu là hình ảnh hoặc video, không cần mã hóa nội dung
    // let encryptedContent = message_content;
    // if (message_type === 'image' || message_type === 'video') {
    //   encryptedContent = message_content;
    // } else {
    //   encryptedContent = encrypt(message_content);
    // }

    const newMessage = new Message({
      conversation_id: new ObjectId(conversationId),
      sender_id: new ObjectId(sender_id),
      message_content: encryptedContent,
      message_type,
      is_read: false,
      read_by: [],
      created_at: new Date(),
      updated_at: new Date()
    })

    await databaseServices.messages.insertOne(newMessage)

    // Lấy danh sách người tham gia cuộc trò chuyện
    const participants = await databaseServices.participants
      .find({ reference_id: new ObjectId(conversationId) })
      .toArray()

    // Thêm logs
    console.log('Sending message to participants:', participants)

    participants.forEach((participant) => {
      const participantId = participant.user_id.toString()
      const senderId = sender_id.toString()

      if (participantId !== senderId) {
        console.log('Emitting to user:', participantId)
        socketService.emitToUser(
          participantId,
          'new_message',
          {
            conversation_id: conversationId,
            message: {
              ...newMessage,
              message_content: decrypt(encryptedContent)
            }
          }
        )
      }
    })

    return newMessage
  }

  async getMessages(conversationId: string, lastMessageId?: string) {
    const limit = 10 // Số lượng tin nhắn mỗi lần lấy
    const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversationId) } as any)

    if (!conversation) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Lấy tin nhắn của cuộc trò chuyện
    const messages = await databaseServices.messages
      .aggregate([
        {
          $match: {
            conversation_id: new ObjectId(conversationId),
            ...(lastMessageId ? { _id: { $lt: new ObjectId(lastMessageId) } } : {})
          }
        },
        { $sort: { _id: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'user',
            let: { sender_id: '$sender_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$sender_id']
                  }
                }
              },
              {
                $project: {
                  username: 1,
                  email: 1,
                  avatar_url: 1
                }
              }
            ],
            as: 'sender'
          }
        },
        {
          $lookup: {
            from: 'user',
            let: { read_by_ids: '$read_by' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      '$_id',
                      {
                        $map: {
                          input: '$$read_by_ids',
                          as: 'id',
                          in: { $toObjectId: '$$id' }
                        }
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  email: 1,
                  avatar_url: 1
                }
              }
            ],
            as: 'read_by_users'
          }
        },
        {
          $unwind: {
            path: '$sender',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            conversation_id: 1,
            message_content: 1,
            message_type: 1,
            is_read: 1,
            created_at: 1,
            updated_at: 1,
            sender: 1,
            read_by_users: 1
          }
        }
      ])
      .toArray()

    const decryptedMessages = messages.map((message: any) => ({
      ...message,
      message_content: message.message_content ? decrypt(message.message_content) : message.message_content
    }))

    return decryptedMessages
  }

  async getLastMessageSeenStatus(conversationId: string) {
    const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversationId) } as any)

    if (!conversation) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const messages = await databaseServices.messages
      .aggregate([
        {
          $match: {
            conversation_id: new ObjectId(conversationId)
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: 'user',
            let: { read_by_ids: '$read_by' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      '$_id',
                      {
                        $map: {
                          input: '$$read_by_ids',
                          as: 'id',
                          in: { $toObjectId: '$$id' }
                        }
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  email: 1,
                  avatar_url: 1
                }
              }
            ],
            as: 'read_by_users'
          }
        },
        {
          $project: {
            _id: 1,
            conversation_id: 1,
            message_content: 1,
            message_type: 1,
            is_read: 1,
            created_at: 1,
            updated_at: 1,
            read_by_users: 1
          }
        }
      ])
      .next()

    return messages
  }
}

export const conversationsService = new ConversationsService()
