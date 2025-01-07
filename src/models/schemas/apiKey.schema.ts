import mongoose, { Document, Schema } from 'mongoose';
import collection from '~/constants/collection';

export interface IApiKey extends Document {
    key: string;
    version: string;
    permissions: string[];
    status: boolean;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const apiKeySchema = new Schema<IApiKey>({
    key: {
        type: String,
        required: true,
        unique: true,
        maxlength: 1024,
        trim: true
    },
    version: { // version của api key, có thể là 1.0.0, 1.0.1, 1.0.2, ... , hoặc sử dụng ngày tháng năm 
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    permissions: {
        type: [String],
        default: ['GENERAL'] // permissions của api key, có thể là ['GENERAL', 'PREMIUM', 'MINIUM', 'FREE', ...]
    },
    status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const ApiKey = mongoose.model<IApiKey>(collection.API_KEY, apiKeySchema);
export default ApiKey;
