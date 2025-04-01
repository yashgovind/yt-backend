import { v2 as cloudinary } from 'cloudinary';
import exp from 'constants';
import fs from "fs";

// console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

// upload file to cloudinary

async function uploadToCloudinary(filepath) {
    try {

        if (!filepath) return null;
        // upload file
        const response = await cloudinary.uploader.upload(filepath, {
             resource_type: 'auto',
        })
        // file uploaded successfully
        // console.log('file has been uploaded', response.url);
        fs.unlinkSync(filepath); // remove the locally saved temporary file after uploading
        return response;
    } catch (error) {
        console.log('Error uploading file to Cloudinary', error);
        fs.unlinkSync(filepath);
        // remove the locally saved temp file as upload operation failed
        return null;
    }
}


export { uploadToCloudinary };
