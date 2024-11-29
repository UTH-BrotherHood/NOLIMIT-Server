import { Schema, model, Document } from 'mongoose'
import collection from '~/constants/collection'
import { UserDocument } from './user.schema';

const TaskSchema = new Schema(
    {
        task_name: { type: String, required: true },
        description: { type: String, required: false },
        status: {
            type: String,
            enum: ['Planning', 'In Progress', 'Completed'],
            default: 'Planning',
        },
        start_date: { type: Date },
        due_date: { type: Date },
        start_time: {
            type: String,
            required: true,
            match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
            errorMessage: "Start time must be in HH:mm format"
        },
        end_time: {
            type: String,
            required: true,
            match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
            errorMessage: "End time must be in HH:mm format"
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: collection.USER,
            required: true,
        },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        // subTasks: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: collection.TASKSLIST,
        //     },
        // ],
    },
    {
        timestamps: true,
    }
)

export interface TaskDocument extends Document {
    task_name: string;
    description: string;
    status: string;
    start_date: Date;
    due_date: Date;
    start_time: Date;
    end_time: Date;
    priority: string;
    creatorId: UserDocument['_id'];
    progress: number;
    // subTasks: string[]
}

const Task = model<TaskDocument>(collection.TASK, TaskSchema)

export default Task
