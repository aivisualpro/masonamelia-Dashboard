import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

export const uploadToCloudinary = (file: File | Buffer, folder: string = 'aircrafts'): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (file instanceof File) { 
        // @ts-ignore
        buffer = Buffer.from(await file.arrayBuffer());
    } else {
        // Fallback for Blob or other types if necessary, though File covers most web APIs
         // @ts-ignore
        buffer = Buffer.from(await file.arrayBuffer());
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
