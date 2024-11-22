import multer from 'multer';
import path from 'path';
import { Request } from "express";

const storage = multer.memoryStorage(); // lưu tệp trong bộ nhớ

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileTypes = /jpeg|jpg|png|heic|mp4|avi|mov/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);


    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only image and video files are allowed"));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }, // 5 MB file size limit
}); // chỉ xử lí tệp đơn
// trường hợp muốn nhiều tệp thì dùng .array('file', 5) (5 là số lượng tệp tối đa)

export default upload;
