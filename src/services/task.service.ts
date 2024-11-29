import { ObjectId } from 'mongodb'
import databaseServices from './database.service'
import { TaskReqBody, UpdateTaskReqBody } from '~/models/requests/tasks.requests';
import Task from '~/models/schemas/task.schema';
import { ErrorWithStatus } from '~/utils/errors';
import { USERS_MESSAGES } from '~/constants/messages';
import HTTP_STATUS from '~/constants/httpStatus';

class TaskService {

    async addAssigneesToTask(task_id: string, assignees: string[], managerId: string) {
        const taskAssignments = assignees.map((assignee: string) => ({
            task_id: new ObjectId(task_id),
            user_id: new ObjectId(assignee),
            role: assignee === managerId ? 'manager' : 'assignee',
            assigned_at: new Date(),
            status: 'active'
        }))

        await databaseServices.taskAssignments.insertMany(taskAssignments)
    }

    async removeAssigneeFromTask(taskId: string, userId: string) {
        const taskIdObject = new ObjectId(taskId);
        const userIdObject = new ObjectId(userId);

        const assignment = await databaseServices.taskAssignments.findOneAndDelete({
            task_id: taskIdObject,
            user_id: userIdObject
        });

        if (!assignment) {
            throw new ErrorWithStatus({
                message: 'Assignment not found.',
                status: HTTP_STATUS.NOT_FOUND,
            });
        }

        return { message: 'User removed from task successfully' };
    }


    async getTasks(user_id: string, limit: number = 10, page: number = 1) {
        const user_id_object = new ObjectId(user_id);

        // Cấu hình phân trang (skip, limit)
        const skip = (page - 1) * limit;

        // Truy vấn sử dụng aggregate để tối ưu hóa hiệu suất
        const tasksCursor = await databaseServices.taskAssignments.aggregate([
            {
                $match: {
                    user_id: user_id_object,
                }
            },
            {
                $lookup: {
                    from: 'task',
                    localField: 'task_id',
                    foreignField: '_id',
                    as: 'task'
                }
            },
            {
                $unwind: '$task'
            },
            {
                $project: {
                    _id: '$task._id',
                    title: '$task.task_name',
                    description: '$task.description',
                    status: '$task.status',
                    assigned_at: '$assigned_at',
                    priority: '$task.priority',
                    due_date: '$task.due_date',
                    start_date: '$task.start_date',
                    progress: '$task.progress',
                    role: '$role',
                    creatorId: '$task.creatorId',
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        const tasks = await tasksCursor.toArray();
        return tasks || [];
    }

    async getTaskById(user_id: string, task_id: string) {
        const user_id_object = new ObjectId(user_id);
        const task_id_object = new ObjectId(task_id);

        const task = await databaseServices.taskAssignments.aggregate([
            {
                $match: {
                    user_id: user_id_object,
                    task_id: task_id_object
                }
            },
            {
                $lookup: {
                    from: 'task',
                    localField: 'task_id',
                    foreignField: '_id',
                    as: 'task'
                }
            },
            {
                $unwind: '$task'
            },
            {
                $project: {
                    _id: '$task._id',
                    title: '$task.task_name',
                    description: '$task.description',
                    status: '$task.status',
                    assigned_at: '$assigned_at',
                    priority: '$task.priority',
                    due_date: '$task.due_date',
                    start_date: '$task.start_date',
                    progress: '$task.progress',
                    role: '$role',
                    creatorId: '$task.creatorId',
                }
            }
        ]);

        return task || {};
    }

    async createTask(user_id: string, payload: TaskReqBody) {
        const user_id_object = new ObjectId(user_id);
        const { task_name, description, status, start_date, due_date, start_time, end_time, priority, assignees } = payload;

        // kiểm tra assignees có tồn tại không
        const users = await databaseServices.users
            .find({
                _id: { $in: assignees.map((id: string) => new ObjectId(id)) }
            })
            .toArray()

        if (users.length !== assignees.length) {
            throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            })
        }

        if (!assignees.includes(user_id)) {
            assignees.push(user_id)
        }

        const task = new Task({
            task_name,
            description,
            status,
            start_date,
            due_date,
            start_time,
            end_time,
            priority,
            progress: 0,
            creatorId: user_id_object
        });

        const result = await databaseServices.tasks.insertOne(task);

        // Gán task cho user
        await taskService.addAssigneesToTask(result.insertedId, assignees, user_id);

        return task;
    }

    async updateTask(task_id: string, payload: UpdateTaskReqBody) {
        const taskIdObject = new ObjectId(task_id);
        const { task_name, description, status, start_date, due_date, start_time, end_time, priority, assignees, managerId } = payload;

        // Kiểm tra assignees có tồn tại không
        const users = await databaseServices.users
            .find({
                _id: { $in: assignees.map((id: string) => new ObjectId(id)) }
            })
            .toArray();

        if (users.length !== assignees.length) {
            throw new ErrorWithStatus({
                message: 'Some users not found',
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        // Cập nhật task thông qua findOneAndUpdate
        const updatedTask = await databaseServices.tasks.findOneAndUpdate(
            { _id: taskIdObject as any },
            {
                $set: {
                    task_name,
                    description,
                    status,
                    start_date,
                    due_date,
                    start_time,
                    end_time,
                    priority
                }
            },
            { returnDocument: 'after' } // Đảm bảo lấy lại tài liệu sau khi cập nhật
        );

        // Kiểm tra xem task đã được cập nhật chưa
        if (!updatedTask) {
            throw new ErrorWithStatus({
                message: 'Task not found or failed to update.',
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        // Cập nhật assignees mới cho task
        const existingAssignments = await databaseServices.taskAssignments.find({ task_id: taskIdObject }).toArray();

        // Tìm những assignees mới chưa có trong bảng TaskAssignments
        const newAssignees = assignees.filter(assigneeId =>
            !existingAssignments.some(assignment => assignment.user_id.toString() === assigneeId)
        );

        // Thêm assignees mới vào TaskAssignments
        const taskAssignments = newAssignees.map((assignee: string) => ({
            task_id: taskIdObject,
            user_id: new ObjectId(assignee),
            role: assignee === managerId ? 'manager' : 'assignee',
            assigned_at: new Date(),
            status: 'active'
        }));

        if (taskAssignments.length > 0) {
            await databaseServices.taskAssignments.insertMany(taskAssignments);
        }

        // Xóa assignees cũ không có trong assignees mới
        const assigneesToRemove = existingAssignments.filter(assignment =>
            !assignees.includes(assignment.user_id.toString())
        ).map(assignment => assignment._id);

        if (assigneesToRemove.length > 0) {
            await databaseServices.taskAssignments.deleteMany({
                _id: { $in: assigneesToRemove }
            });
        }

        return updatedTask;
    }


    async deleteTask(task_id: string) {
        const taskIdObject = new ObjectId(task_id);

        // Bước 1: Xóa các assignees liên quan đến task
        const result = await databaseServices.taskAssignments.deleteMany({
            task_id: taskIdObject,
        });

        if (result.deletedCount === 0) {
            throw new ErrorWithStatus({
                message: 'No assignees found for this task.',
                status: HTTP_STATUS.NOT_FOUND,
            });
        }

        // Bước 2: Xóa task
        const deletedTask = await databaseServices.tasks.findOneAndDelete({
            _id: taskIdObject as any,
        });

        if (!deletedTask) {
            throw new ErrorWithStatus({
                message: 'Task not found.',
                status: HTTP_STATUS.NOT_FOUND,
            });
        }

        return { message: 'Task deleted successfully.' };
    }

}

export const taskService = new TaskService()