import { Schema, model, Document } from 'mongoose';
import collection from '~/constants/collection';
import { UserDocument } from './user.schema';
import { TaskDocument } from './task.schema';

const TaskAssignmentSchema = new Schema(
    {
        task_id: {
            type: Schema.Types.ObjectId,
            ref: collection.TASK,
            required: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: collection.USER,
            required: true,
        },
        role: {
            type: String,
            enum: ['assignee', 'manager', 'observer'],
            default: 'assignee',
        },
        assigned_at: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'pending', 'failed'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

export interface TaskAssignmentDocument extends Document {
    task_id: TaskDocument['_id'];
    user_id: UserDocument['_id'];
    role: string;
    assigned_at: Date;
    status: string;
}

const TaskAssignment = model<TaskAssignmentDocument>(collection.TASK_ASSIGNMENT, TaskAssignmentSchema);

export default TaskAssignment;
