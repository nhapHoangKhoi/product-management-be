const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({ 
   cloud_name: process.env.CLOUD_NAME, 
   api_key: process.env.CLOUD_KEY, 
   api_secret: process.env.CLOUD_SECRET
});

// this function is used to upload to cloudinary
module.exports = (buffer) => 
{
   return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
         {
            resource_type: "auto"
         },
         (error, result) => {
            if (result) {
               resolve(result);
            } 
            else {
               reject(error);
            }
         }
      );

      streamifier.createReadStream(buffer).pipe(stream);
   });
}