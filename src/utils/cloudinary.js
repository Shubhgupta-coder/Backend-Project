// Server pr hamare paas file aa chuki hogi ab server se hme local file ka path milega or hm use cloudinary par daal denhge
// Now server pr agar hmari successfully file upooad hoagayi h to ham use server se remove krdenge

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
}); 

// This localfile path contains the url of local file path
const uploadOnCloudinary = async (localFilePath)=>{
      try {
        // Agar local file hi nhi hui toh
        if(!localFilePath) return null
        
        // Upload the file on cloudinary in this we are given the path of our local file and it also contains many other options like what type of file we are going to upload
        const response = await cloudinary.uploader.upload(localFilePath,
            // Secondly it conatins of many options
            {
                resource_type:'auto'
            }
        )

        // file has been uplaoded successfully and we got the URL here
        console.log("File has been uploaded Successfully",response.url);
        return response
      } catch (error) {
         fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
         return null;
      }
} 

export {uploadOnCloudinary}