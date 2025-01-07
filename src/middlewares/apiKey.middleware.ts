import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from '~/constants/httpStatus';
import { HEADERS } from '~/models/requests/apiKey.requests';
import { apiKeyService } from '~/services/apiKey.service';
import { ErrorWithStatus } from '~/utils/errors';

export const checkApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers[HEADERS.API_KEY]?.toString();

    if (!apiKey) {
        throw new ErrorWithStatus({
            message: 'API key missing...',
            status: HTTP_STATUS.FORBIDDEN
        })
    }

    const keyData = await apiKeyService.validateApiKey(apiKey as string);

    // Thêm thông tin API key vào request để sử dụng ở các middleware tiếp theo
    req.apiKey = keyData;
    next();
};
