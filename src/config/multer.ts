import multer from 'multer';
import path from 'path';
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileTypes = /jpeg|jpg|png|heic|mp4|avi|mov|pdf|doc|docx|mp3|wav/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Unsupported file type"));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 20 }, // 20 MB
});
// trường hợp muốn nhiều tệp thì dùng .array('file', 5) (5 là số lượng tệp tối đa)

export default upload;
