import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return false;
    // Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log(`File uploaded on cloudinary : ${response.url}`);
    // console.log("Response : ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return false;
  }
};

export { uploadOnCloudinary };
