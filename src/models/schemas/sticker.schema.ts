import mongoose, { Schema, Document } from 'mongoose';
import collection from '~/constants/collection';

export interface IStickerDocument extends Document {
    sticker_url: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

const StickerSchema: Schema = new Schema(
    {
        sticker_url: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: null,
            trim: true
        },
        is_active: {
            type: Boolean,
            default: true // Sticker mặc định là hoạt động, nếu không hoạt động thì không hiển thị
        }
    },
    {
        timestamps: true,
    }
);

const Sticker = mongoose.model<IStickerDocument>(collection.STICKER, StickerSchema);

export default Sticker;