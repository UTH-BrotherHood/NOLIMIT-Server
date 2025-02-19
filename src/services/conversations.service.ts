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
import { MessageAttachment } from '~/models/schemas/message_attachment.schema'
import { attachmentService } from './attachment.service'

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

  async getConversations(user_id: string, page: number = 1, limit: number = 10) {
    const user_id_object = new ObjectId(user_id)

    const conversations = await databaseServices.participants
      .aggregate([
        // 1. Lọc các participants mà user_id tham gia
        {
          $match: { user_id: user_id_object }
        },
        // 2. Kết nối với bảng conversations
        {
          $lookup: {
            from: 'conversation',
            localField: 'reference_id',
            foreignField: '_id',
            as: 'conversationDetails'
          }
        },
        { $unwind: '$conversationDetails' },
        // 3. Kết nối với bảng group nếu là nhóm
        {
          $lookup: {
            from: 'group',
            localField: 'conversationDetails.group_id',
            foreignField: '_id',
            as: 'groupDetails'
          }
        },
        // 4. Kết nối với bảng user nếu là cuộc trò chuyện cá nhân
        {
          $lookup: {
            from: 'user',
            let: {
              is_group: '$conversationDetails.is_group',
              participants: {
                $cond: {
                  if: { $eq: [{ $type: '$conversationDetails.conversation_name' }, 'object'] },
                  then: { $objectToArray: '$conversationDetails.conversation_name' },
                  else: []
                }
              }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$$is_group', false] },
                      { $ne: ['$_id', user_id_object] },
                      {
                        $in: [
                          '$_id',
                          {
                            $map: {
                              input: '$$participants',
                              as: 'participant',
                              in: { $toObjectId: '$$participant.k' }
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  username: 1,
                  avatar_url: 1, // Lấy ảnh đại diện
                  status: 1, // Lấy trạng thái (online/offline)
                  tag: 1 // Chỉ lấy trường username
                }
              }
            ],
            as: 'otherUserDetails' // Kết quả của $lookup sẽ lưu vào trường này
          }
        },
        // 5. Định hình dữ liệu trả về cho participants
        {
          $addFields: {
            participants: {
              $cond: {
                if: { $eq: ['$conversationDetails.is_group', true] },
                then: {
                  name: { $arrayElemAt: ['$groupDetails.name', 0] },
                  avatar_url: { $arrayElemAt: ['$groupDetails.avatar_url', 0] },
                  announcement: { $arrayElemAt: ['$groupDetails.announcement', 0] }
                },
                else: {
                  name: { $arrayElemAt: ['$otherUserDetails.username', 0] },
                  avatar_url: { $arrayElemAt: ['$otherUserDetails.avatar_url', 0] },
                  status: { $arrayElemAt: ['$otherUserDetails.status', 0] },
                  tag: { $arrayElemAt: ['$otherUserDetails.tag', 0] }
                }
              }
            }
          }
        },
        // 6. Lọc chỉ người dùng hiện tại trong conversation_name và loại bỏ phần tử không hợp lệ
        {
          $addFields: {
            conversation_name: {
              $cond: {
                if: { $eq: [{ $type: '$conversationDetails.conversation_name' }, 'object'] },
                then: {
                  $let: {
                    vars: {
                      participant: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: { $objectToArray: '$conversationDetails.conversation_name' },
                              as: 'item',
                              cond: {
                                $eq: ['$$item.k', user_id] // Kiểm tra khóa là user_id
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: '$$participant.v' // Trả về giá trị của người dùng (tên)
                  }
                },
                else: '$conversationDetails.conversation_name' // Nếu không phải object, giữ nguyên
              }
            }
          }
        },
        // 7. Lấy tin nhắn cuối cùng cho mỗi cuộc trò chuyện và kết nối với người gửi
        {
          $lookup: {
            from: 'message',
            localField: 'conversationDetails._id',
            foreignField: 'conversation_id',
            pipeline: [
              {
                $sort: { created_at: -1 }
              },
              {
                $limit: 1
              },
              {
                $lookup: {
                  from: 'user',
                  localField: 'sender_id',
                  foreignField: '_id',
                  as: 'senderDetails'
                }
              },
              // Lấy tất cả các trường của message cần thiết
              {
                $project: {
                  _id: 1,
                  message_content: 1,
                  message_type: 1,
                  is_read: 1,
                  read_by: 1,
                  created_at: 1,
                  updated_at: 1,
                  senderDetails: {
                    $arrayElemAt: ['$senderDetails', 0] // Lấy phần tử đầu tiên trong mảng senderDetails
                  }
                }
              }
            ],
            as: 'last_message'
          }
        },
        // 8. Định hình lại trường last_message
        {
          $addFields: {
            last_message: {
              $arrayElemAt: ['$last_message', 0]
            }
          }
        },
        // 9. Chỉ lấy username từ senderDetails
        {
          $addFields: {
            'last_message.senderDetails': {
              username: '$last_message.senderDetails.username' // Lấy chỉ username
            }
          }
        },
        // 10. Xóa các trường không cần thiết trong last_message
        {
          $project: {
            'last_message.senderDetails.email': 0,
            'last_message.senderDetails.password': 0,
            'last_message.senderDetails.date_of_birth': 0,
            'last_message.senderDetails.avatar_url': 0,
            'last_message.senderDetails.bio': 0,
            'last_message.senderDetails.status': 0,
            'last_message.senderDetails.tag': 0,
            'last_message.senderDetails.forgot_password': 0,
            'last_message.senderDetails.verify': 0,
            'last_message.senderDetails.created_at': 0,
            'last_message.senderDetails.updated_at': 0,
            'last_message.senderDetails.last_login_time': 0,
            'last_message.senderDetails.forgot_password_token': 0
          }
        },
        // 11. Sắp xếp theo thời gian cập nhật mới nhất
        { $sort: { 'conversationDetails.last_message_time': -1 } },
        // 12. Phân trang
        { $skip: (page - 1) * limit },
        { $limit: limit },
        // 13. Chỉ chọn các trường cần thiết
        {
          $project: {
            _id: '$conversationDetails._id',
            conversation_name: 1,
            is_group: '$conversationDetails.is_group',
            creator: '$conversationDetails.creator',
            created_at: '$conversationDetails.created_at',
            updated_at: '$conversationDetails.updated_at',
            participants: 1,
            last_message: 1
          }
        }
      ])
      .toArray()

    // Giải mã nội dung tin nhắn cuối cùng
    conversations.forEach((conversation) => {
      if (conversation.last_message && conversation.last_message.message_content) {
        conversation.last_message.message_content = decrypt(conversation.last_message.message_content)
      }
    })

    return conversations || []
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
    const { participants, conversation_name, avatar_url, announcement } = payload
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

    await attachmentService.createAttachment({
      attachment_type: 'image',
      file_url: avatar_url
    })

    // Tạo nhóm mới
    const newGroup = new Group({
      name: conversation_name,
      creator: new ObjectId(user_id),
      avatar_url: avatar_url || '', // Add appropriate default value
      announcement: announcement || '', // Add appropriate default value
      created_at: new Date(),
      updated_at: new Date()
      // Add other required properties with default values
    })
    const result = await databaseServices.groups.insertOne(newGroup)

    const createdGroup = await databaseServices.groups.findOne({ _id: result.insertedId })

    // Tạo cuộc trò chuyện nhóm và liên kết với nhóm
    const newConversation = await conversationsService.createConversation({
      conversation_name,
      is_group: true,
      creator: new ObjectId(user_id),
      group_id: result.insertedId
    })

    // Thêm các thành viên vào bảng participants
    await conversationsService.addParticipantsToConversation(newConversation._id, 'group', participants, user_id)

    return {
      conversation: {
        ...newConversation,
        group_id: createdGroup?._id
      },
      group_summary: {
        name: createdGroup?.name,
        avatar_url: createdGroup?.avatar_url,
        announcement: createdGroup?.announcement
      }
    }
  }

  async getConversationById(conversationId: string) {
    const conversationIdObject = new ObjectId(conversationId)

    const conversation = await databaseServices.conversations
      .aggregate([
        // 1. Tìm cuộc trò chuyện theo ID
        {
          $match: { _id: conversationIdObject }
        },
        // 2. Nếu là cuộc trò chuyện nhóm, kết nối với bảng group
        {
          $lookup: {
            from: 'group',
            localField: 'group_id',
            foreignField: '_id',
            as: 'groupDetails'
          }
        },
        // 3. Kết nối với bảng participants để lấy danh sách người tham gia
        {
          $lookup: {
            from: 'participant',
            localField: '_id',
            foreignField: 'reference_id',
            as: 'participants'
          }
        },
        // 4. Kết nối với bảng user để lấy chi tiết thông tin người tham gia
        {
          $lookup: {
            from: 'user',
            let: { participants: '$participants' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', { $map: { input: '$$participants', as: 'p', in: '$$p.user_id' } }]
                  }
                }
              },
              {
                $project: { username: 1, avatar_url: 1, status: 1, tag: 1 }
              }
            ],
            as: 'userDetails'
          }
        },
        // 5. Định hình lại participants để bao gồm chi tiết thông tin người dùng
        {
          $addFields: {
            participants: {
              $map: {
                input: '$participants',
                as: 'participant',
                in: {
                  $mergeObjects: [
                    '$$participant',
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$userDetails',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$participant.user_id'] }
                          }
                        },
                        0
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        // 6. Sắp xếp participants theo role
        {
          $addFields: {
            participants: {
              $sortArray: {
                input: '$participants',
                sortBy: { role: 1 } // Sort by role (admin first)
              }
            }
          }
        },
        // 7. Lấy avatar_url từ group nếu là group, từ user nếu là 1-1
        {
          $addFields: {
            avatar_url: {
              $cond: {
                if: { $eq: ['$is_group', true] },
                then: { $arrayElemAt: ['$groupDetails.avatar_url', 0] },
                else: { $arrayElemAt: ['$userDetails.avatar_url', 0] }
              }
            }
          }
        },
        // 8. Xử lý conversation_name cho trường hợp cá nhân
        {
          $addFields: {
            conversation_name: {
              $cond: {
                if: { $eq: ['$is_group', false] }, // Nếu là cuộc trò chuyện cá nhân
                then: {
                  $let: {
                    vars: {
                      conversationObj: { $objectToArray: '$conversation_name' }
                    },
                    in: {
                      $arrayElemAt: ['$$conversationObj.v', 1] // Lấy phần tử thứ 2 (v) trong object conversation_name
                    }
                  }
                },
                else: '$conversation_name' // Nếu là nhóm thì giữ nguyên conversation_name
              }
            }
          }
        },

        // 9. Lấy các tin nhắn và file đính kèm liên quan
        {
          $lookup: {
            from: 'message',
            localField: '_id',
            foreignField: 'conversation_id',
            as: 'messages'
          }
        },
        // 10. Lấy tất cả các message_attachment cho các tin nhắn trong cuộc trò chuyện
        {
          $lookup: {
            from: 'message_attachment',
            localField: 'messages._id',
            foreignField: 'message_id',
            as: 'messageAttachments'
          }
        },
        // 11. Lấy thông tin attachment chi tiết dựa trên attachment_id
        {
          $lookup: {
            from: 'attachment',
            localField: 'messageAttachments.attachment_id',
            foreignField: '_id',
            as: 'attachments'
          }
        },
        // 12. Giữ lại tất cả các attachments (không unwind)
        {
          $addFields: {
            attachments: {
              $map: {
                input: '$attachments',
                as: 'attachment',
                in: {
                  _id: '$$attachment._id',
                  attachment_type: '$$attachment.attachment_type',
                  file_url: '$$attachment.file_url',
                  created_at: '$$attachment.created_at'
                }
              }
            }
          }
        },

        // 13. Chỉ giữ lại các trường cần thiết
        {
          $project: {
            _id: 1,
            conversation_name: 1,
            avatar_url: 1,
            is_group: 1,
            creator: 1,
            created_at: 1,
            updated_at: 1,
            participants: 1,
            attachments: 1 // Trả về tất cả các attachments
          }
        }
      ])
      .toArray()

    if (!conversation || conversation.length === 0) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return conversation[0] || null
  }

  async deleteConversation(conversation: any) {
    await databaseServices.conversations.deleteOne({ _id: conversation._id })
    await databaseServices.participants.deleteMany({ reference_id: conversation._id })
    if (conversation.is_group && conversation.group_id) {
      await databaseServices.groups.deleteOne({ _id: conversation.group_id })
    }
    // await databaseServices.messages.deleteMany({ conversation_id: new ObjectId(conversationId) });
  }

  async createMessage({
    conversation_id,
    sender_id,
    message_type,
    message_content = null,
    sticker_id = null,
    file_url = null
  }: {
    conversation_id: string
    sender_id: string
    message_type: string
    message_content?: string | null
    sticker_id?: string | null
    file_url?: string | null
  }) {
    const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversation_id) } as any)

    if (!conversation) {
      throw new ErrorWithStatus({
        message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const encryptedContent = message_content ? encrypt(message_content) : null

    const newMessage = new Message({
      conversation_id: new ObjectId(conversation_id),
      sender_id: new ObjectId(sender_id),
      message_content: encryptedContent,
      message_type,
      sticker_id: sticker_id || undefined,
      is_read: false,
      read_by: [],
      created_at: new Date(),
      updated_at: new Date()
    })

    await databaseServices.messages.insertOne(newMessage)

    await databaseServices.conversations.updateOne({ _id: new ObjectId(conversation_id) } as any, {
      $set: { last_message_time: new Date() }
    })

    this.emitMessageToParticipants(conversation_id, sender_id, newMessage, file_url || undefined)

    return newMessage
  }

  // lien ket tin nhan voi file dinh kem
  async linkAttachmentToMessage({ attachmentId, messageId }: { attachmentId: string; messageId: string }) {
    const attachmentObject = new MessageAttachment({
      attachment_id: new ObjectId(attachmentId),
      message_id: new ObjectId(messageId)
    })

    await databaseServices.messageAttachments.insertOne(attachmentObject)
  }

  async linkAttachmentsToMessage(messageId: string, attachmentIds: string[]) {
    const attachmentObjects = attachmentIds.map(
      (id) =>
        new MessageAttachment({
          attachment_id: new ObjectId(id),
          message_id: new ObjectId(messageId)
        })
    )

    await databaseServices.messageAttachments.insertMany(attachmentObjects)
  }

  async emitMessageToParticipants(conversation_id: string, sender_id: string, message: any, file_url?: string) {
    const participants = await databaseServices.participants
      .find({ reference_id: new ObjectId(conversation_id) })
      .toArray()

    console.log('Sending message to participants:', participants)

    participants.forEach((participant) => {
      const participantId = participant.user_id.toString()
      const senderId = sender_id.toString()

      if (participantId !== senderId) {
        console.log('Emitting to user:', participantId)
        socketService.emitToUser(participantId, 'new_message', {
          conversation_id: conversation_id,
          message: {
            ...message,
            file_url: (message.message_type !== 'text' && file_url) ? file_url : undefined, // Đính kèm URL file voice nếu có
            message_content: message.message_content ? decrypt(message.message_content) : null
          }
        })
      }
    })
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
        },
        {
          $lookup: {
            from: 'message_attachment',
            let: { message_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$message_id', '$$message_id']
                  }
                }
              },
              {
                $lookup: {
                  from: 'attachment',
                  localField: 'attachment_id',
                  foreignField: '_id',
                  as: 'attachment_details'
                }
              },
              {
                $unwind: {
                  path: '$attachment_details',
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  attachment_type: '$attachment_details.attachment_type',
                  file_url: '$attachment_details.file_url',
                  created_at: '$attachment_details.created_at',
                  _id: 0
                }
              }
            ],
            as: 'attachments'
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
