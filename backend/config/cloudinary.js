import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configure cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filepath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filepath, { use_filename: true });
    fs.unlinkSync(filepath);
    return uploadResult.secure_url;
  } catch (error) {
    fs.unlinkSync(filepath);
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

export default uploadOnCloudinary;