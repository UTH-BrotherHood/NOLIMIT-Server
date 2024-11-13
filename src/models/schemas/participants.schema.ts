import { Schema, model } from 'mongoose';
import collection from '~/constants/collection';
import { ConversationDocument } from '~/models/schemas/conversation.schema';
import { UserDocument } from '~/models/schemas/user.schema';
import { GroupDocument } from '~/models/schemas/group.schema';

const ParticipantSchema = new Schema({
    reference_id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'type',
    },
    type: {
        type: String,
        required: true,
        enum: ['conversation', 'group'], // Xác định là cuộc trò chuyện hay nhóm
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: collection.USER,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member',
    },
    status: {
        type: String,
        enum: ['active', 'left', 'banned'],
        default: 'active',
    },
    joined_at: {
        type: Date,
        default: Date.now,
    },
});

export interface ParticipantDocument {
    reference_id: string | ConversationDocument['_id'] | GroupDocument['_id'];
    type: 'conversation' | 'group';
    user_id: UserDocument['_id'];
    role: 'admin' | 'member';
    status: 'active' | 'left' | 'banned';
    joined_at: Date;
}

const Participant = model<ParticipantDocument>(collection.PARTICIPANT, ParticipantSchema);

export default Participant;
