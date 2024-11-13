import { ConversationOneToOneReqBody } from "~/models/requests/conversations.requests";
import databaseServices from "./database.service";
import { CONVERSATION_MESSAGES, USERS_MESSAGES } from "~/constants/messages";
import HTTP_STATUS from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/utils/errors";
import Conversation from "~/models/schemas/conversation.schema";
import { ObjectId } from "mongodb";
import Group from "~/models/schemas/group.schema";

class ConversationsService {
    async createConversation(conversationData: {
        conversation_name: any,
        is_group: boolean,
        creator: ObjectId,
        group_id?: ObjectId
    }) {
        const newConversation = new Conversation(conversationData);
        const result = await databaseServices.conversations.insertOne(newConversation);
        return { _id: result.insertedId, ...conversationData };
    }

    async addParticipantsToConversation(conversationId: ObjectId, type: string, participants: string[], creatorId: string) {
        const participantsData = participants.map(userId => ({
            reference_id: new ObjectId(conversationId),
            type: type as 'conversation' | 'group',
            user_id: new ObjectId(userId),
            role: (type === 'group' && userId === creatorId ? 'admin' : 'member') as 'admin' | 'member',
            status: 'active' as 'active' | 'left' | 'banned',
            joined_at: new Date(),
        }));

        await databaseServices.participants.insertMany(participantsData);
    }

    async getConversations(user_id: string) {
        const user_id_object = new ObjectId(user_id);

        // Lấy thông tin cuộc trò chuyện mà user_id tham gia
        const conversations = await databaseServices.participants.aggregate([
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
        ]).toArray();

        return conversations;
    }

    async createOneToOneConversation(user_id: string, payload: ConversationOneToOneReqBody) {
        const { participants } = payload;

        const sortedParticipants = participants.sort();

        // Tìm các participants tương ứng với cuộc trò chuyện 1-1 giữa hai user
        const existingParticipantConversations = await databaseServices.participants
            .aggregate([
                {
                    $match: {
                        type: 'conversation',
                        user_id: { $in: sortedParticipants.map(id => new ObjectId(id)) }
                    }
                },
                {
                    $group: {
                        _id: "$reference_id",
                        participantCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        participantCount: 2
                    }
                }
            ])
            .toArray();

        // Nếu tìm thấy cuộc trò chuyện 1-1 đã tồn tại
        if (existingParticipantConversations.length > 0) {
            throw new ErrorWithStatus({
                message: CONVERSATION_MESSAGES.CONVERSATION_ALREADY_EXIST,
                status: HTTP_STATUS.CONFLICT
            });
        }

        // Lấy thông tin của người dùng
        const [currentUser, otherUser] = await Promise.all([
            databaseServices.users.findOne({ _id: new ObjectId(user_id) }),
            databaseServices.users.findOne({ _id: new ObjectId(participants.find(id => id !== user_id)) })
        ]);

        if (!currentUser || !otherUser) {
            throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        // Tạo tên cuộc trò chuyện theo tên người dùng
        const conversationName = {
            [user_id]: otherUser.username,
            [otherUser._id.toString()]: currentUser.username,
        };

        // Tạo cuộc trò chuyện 1-1
        const newConversation = await conversationsService.createConversation({
            conversation_name: conversationName,
            is_group: false,
            creator: new ObjectId(user_id),
        });

        // có thể gọi tới ParticipantsService.createParticipant
        await conversationsService.addParticipantsToConversation(newConversation._id, 'conversation', participants, user_id);

        return newConversation;
    }

    async createPrivateGroup(user_id: string, payload: any) {
        const { participants, conversation_name, is_group } = payload;
        // const currentUserId = user_id;

        // Kiểm tra các user_id có hợp lệ không
        const users = await databaseServices.users.find({
            _id: { $in: participants.map((id: string) => new ObjectId(id)) }
        }).toArray();

        // Nếu số lượng user_id không bằng số lượng participants thì trả về lỗi
        if (users.length !== participants.length) {
            throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        // Đảm bảo người tạo được thêm vào danh sách thành viên
        if (!participants.includes(user_id)) {
            participants.push(user_id);
        }

        // Tạo nhóm mới
        const newGroup = new Group({
            name: conversation_name,
            creator: new ObjectId(user_id),
            avatar_url: '', // Add appropriate default value
            announcement: '', // Add appropriate default value
            created_at: new Date(),
            updated_at: new Date(),
            // Add other required properties with default values
        });
        const result = await databaseServices.groups.insertOne(newGroup);

        // Tạo cuộc trò chuyện nhóm và liên kết với nhóm
        const newConversation = await conversationsService.createConversation({
            conversation_name,
            is_group: true,
            creator: new ObjectId(user_id),
            group_id: result.insertedId,
        });

        // Thêm các thành viên vào bảng participants
        await conversationsService.addParticipantsToConversation(newConversation._id, 'group', participants, user_id);

        return newConversation;
    }

    async getConversationById(conversationId: string) {
        const conversation = await databaseServices.conversations.findOne({ _id: new ObjectId(conversationId) } as any);

        if (!conversation) {
            throw new ErrorWithStatus({
                message: CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        return conversation;
    }

    async deleteConversation(conversation: any) {
        await databaseServices.conversations.deleteOne({ _id: conversation._id });
        await databaseServices.participants.deleteMany({ reference_id: conversation._id });
        if (conversation.is_group && conversation.group_id) {
            await databaseServices.groups.deleteOne({ _id: conversation.group_id });
        }
        // await databaseServices.messages.deleteMany({ conversation_id: new ObjectId(conversationId) });
    }
}

export const conversationsService = new ConversationsService();