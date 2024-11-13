import { AddParticipantReqBody } from "~/models/requests/participants.requests";
import { ObjectId } from "mongodb";
import databaseServices from "./database.service";
import { ErrorWithStatus } from "~/utils/errors";
import HTTP_STATUS from "~/constants/httpStatus";

class ParticipantsService {

    // Hàm tạo mới một participant
    async createParticipant(payload: AddParticipantReqBody) {
        const { reference_id, type, user_ids } = payload;

        // Tạo danh sách `newParticipants` chứa tất cả các thành viên mà không cần kiểm tra sự tồn tại
        const newParticipants = user_ids.map((userId) => ({
            reference_id: new ObjectId(reference_id),
            type,
            user_id: new ObjectId(userId),
            role: 'member',       // Mặc định là thành viên
            status: 'active',      // Mặc định trạng thái là 'active'
            joined_at: new Date(), // Gán ngày giờ hiện tại khi thêm thành viên mới
        }));

        // Thêm participant mới vào cơ sở dữ liệu
        await databaseServices.participants.insertMany(newParticipants);

        return newParticipants;
    }


    // Hàm thêm người dùng vào cuộc trò chuyện hoặc nhóm
    // trước khi gọi hàm này, cần kiểm tra tính hợp lệ của user_id
    async addParticipant(payload: AddParticipantReqBody) {
        const { reference_id, type, user_ids } = payload;

        if (type !== "group") {
            throw new ErrorWithStatus({
                message: "Invalid type, must be group",
                status: HTTP_STATUS.BAD_REQUEST
            });
        }

        // Kiểm tra các participants đã tồn tại 
        const existingParticipants = await databaseServices.participants.find({
            reference_id: new ObjectId(reference_id),
            type,
            user_id: { $in: user_ids.map((id) => new ObjectId(id)) },
        }).toArray();

        // Lọc ra các user_ids đã tồn tại
        const existingUserIds = new Set(existingParticipants.map((p) => p.user_id.toString()));

        // Lọc ra các user_ids mới
        const newParticipants = user_ids
            .filter((userId) => !existingUserIds.has(userId))
            .map((userId) => ({
                reference_id: new ObjectId(reference_id),
                type,
                user_id: new ObjectId(userId),
                role: 'member',
                status: 'active',
                joined_at: new Date(),
            }));

        // Nếu không có participants mới, báo lỗi
        if (newParticipants.length === 0) {
            throw new ErrorWithStatus({
                message: "All participants already exist",
                status: HTTP_STATUS.CONFLICT
            });
        }

        // Thêm tất cả các participants mới vào cơ sở dữ liệu
        await databaseServices.participants.insertMany(newParticipants);

        return newParticipants;
    }
}

const participantsService = new ParticipantsService()

export default participantsService