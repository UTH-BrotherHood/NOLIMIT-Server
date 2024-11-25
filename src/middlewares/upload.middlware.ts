import { uploadFile } from '~/utils/fileUploader';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import HTTP_STATUS from '~/constants/httpStatus';

export const uploadMiddleware = async (req: Request<ParamsDictionary>, res: Response, next: NextFunction) => {
    try {
        // const { upload_service, folder, message_type } = req.body;
        const { upload_service = "cloudinary", folder = "default_folder", file_type = "raw" } = req.body;

        if (!req.file) return next();

        const fileUrl = await uploadFile({
            file: req.file,
            upload_service,
            folder,
            fileType: file_type,
        });


        req.fileUrl = fileUrl;
        next();
    } catch (error) {
        const err = error as Error;
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

