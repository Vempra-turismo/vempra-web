import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'node:buffer';
import type { UploadImageFn } from '@/types';

// Configura Cloudinary una sola vez cuando este módulo se importa.
cloudinary.config({
    cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// La función para subir la imagen, ahora exportada desde este módulo.
export const uploadImage: UploadImageFn = async (file, folder) => {
    if (!file || file.size === 0) return '';
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
            uploadStream.end(buffer);
        });
        return uploadResult.secure_url;
    } catch (e) {
        console.error(`Error al subir la imagen a Cloudinary (folder: ${folder}):`, e);
        const message = e instanceof Error ? e.message : String(e);
        throw new Error(`Error al procesar la imagen: ${message}`);
    }
};
