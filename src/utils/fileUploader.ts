import cloudinary from '~/config/cloudinary';
import AWS from 'aws-sdk';
import admin from 'firebase-admin';
import stream from 'stream';
import { RedisClientType, createClient } from 'redis';

// Redis Client
// const redisClient: RedisClientType = createClient();
// redisClient.connect();

// // AWS S3
// const s3 = new AWS.S3({ region: 'your-region', accessKeyId: 'your-key', secretAccessKey: 'your-secret' });

// // Firebase
// const bucket = admin.storage().bucket();

// Tải file lên Cloudinary
export const uploadToCloudinary = async (
    file: Express.Multer.File,
    folder: string,
    resourceType: "image" | "video" | "raw" | "auto"
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                resolve(result?.secure_url || "");
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
    });
};

// // Tải file lên Amazon S3
// export const uploadToS3 = async (
//     file: Express.Multer.File,
//     folder: string
// ): Promise<string> => {
//     try {
//         const params = {
//             Bucket: "your-bucket-name",
//             Key: `${folder}/${Date.now()}_${file.originalname}`,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//         };

//         const result = await s3.upload(params).promise();
//         return result.Location || "";
//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error(`S3 upload failed: ${error.message}`);
//         } else {
//             throw new Error('S3 upload failed');
//         }
//     }
// };


// // Tải file lên Firebase Storage
// export const uploadToFirebase = async (
//     file: Express.Multer.File,
//     folder: string
// ): Promise<string> => {
//     const fileRef = bucket.file(`${folder}/${Date.now()}_${file.originalname}`);
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(file.buffer);

//     return new Promise((resolve, reject) => {
//         bufferStream
//             .pipe(fileRef.createWriteStream({ contentType: file.mimetype }))
//             .on("finish", () => resolve(fileRef.publicUrl()))
//             .on("error", (error) => reject(new Error(`Firebase upload failed: ${error.message}`)));
//     });
// };

// export const cacheSticker = async (stickerId: string, url: string): Promise<void> => {
//     await redisClient.set(stickerId, url, { EX: 3600 }); // Cache trong 1 giờ
// };

// export const getStickerFromCache = async (stickerId: string): Promise<string | null> => {
//     return redisClient.get(stickerId);
// };


export async function uploadFile({
    file,
    upload_service,
    folder = "default_folder",
    fileType = "raw",
}: {
    file: Express.Multer.File;
    upload_service: "cloudinary" | "s3" | "firebase";
    folder?: string;
    fileType?: "image" | "video" | "raw" | "auto";
}): Promise<string> {
    switch (upload_service) {
        case "cloudinary":
            return await uploadToCloudinary(file, folder, fileType);
        // case "s3":
        //     return await uploadToS3(file, folder);
        // case "firebase":
        //     return await uploadToFirebase(file, folder);
        default:
            throw new Error("Unsupported upload service");
    }
}
