import { ObjectId } from "mongodb";
import { CreateGroupReqBody } from "~/models/requests/groups.requests";
import databaseServices from "./database.service";
import Group from "~/models/schemas/group.schema";

class GroupService {
    async createGroup(user_id: string, payload: CreateGroupReqBody) {
        const { group_name, participants } = payload;
        const currentUserId = user_id;

        const newGroup = new Group({
            name: group_name,
            creator: currentUserId,
        });

        const insertedGroup = await databaseServices.groups.insertOne(newGroup);
        const groupId = insertedGroup.insertedId;

        // Thêm tất cả thành viên vào bảng participants
        const participantsData = participants.map((participantId) => ({
            reference_id: groupId,
            type: 'group',
            user_id: new ObjectId(participantId),
            role: participantId === user_id ? 'admin' : 'member', // Người tạo là admin, còn lại là member
            status: 'active',
            joined_at: new Date(),
        }));

        await databaseServices.participants.insertMany(participantsData);

        return { group: newGroup, participants: participantsData };
    }
}

const groupsService = new GroupService();
export default groupsService;