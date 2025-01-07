// import { v4 as uuidv4 } from 'uuid';
import HTTP_STATUS from '~/constants/httpStatus';
import ApiKey, { IApiKey } from '~/models/schemas/apiKey.schema';
import { ErrorWithStatus } from '~/utils/errors';
import sanitize from 'mongo-sanitize';
import databaseServices from './database.service';

class ApiKeyService {
    // // Tạo API key mới
    // async generateApiKey(data: {
    //     name: string;
    //     clientId: string;
    //     permissions?: string[];
    //     expiresAt?: Date;
    // }): Promise<IApiKey> {
    //     const key = uuidv4();


    //     return await ApiKey.save();
    // }

    // Xác thực API key
    async validateApiKey(key: string) {
        const apiKey = await databaseServices.apiKeys.findOne({ key: sanitize(key) });

        if (!apiKey) {
            throw new ErrorWithStatus({
                message: 'Invalid or expired API key',
                status: HTTP_STATUS.UNAUTHORIZED
            })
        }

        return apiKey;
    }

    // // Vô hiệu hóa API key
    // async deactivateApiKey(key: string): Promise<boolean> {
    //     const result = await ApiKey.updateOne(
    //         { key },
    //         { isActive: false }
    //     );
    //     return result.modifiedCount > 0;
    // }

    // // Cập nhật thông tin API key
    // async updateApiKey(key: string, updates: Partial<IApiKey>): Promise<IApiKey | null> {
    //     return await ApiKey.findOneAndUpdate(
    //         { key },
    //         { $set: updates },
    //         { new: true }
    //     );
    // }
}

export const apiKeyService = new ApiKeyService();