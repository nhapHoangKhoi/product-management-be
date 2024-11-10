const streamUpload = require("../../helpers/streamUpload.helper.js");
 
module.exports.uploadSingleFile = async (req, res, next) => 
{
   if(req.file) // neu co file up len thi cho len cloudinary
                // req.file chinh la cai file ma nguoi dung up len 
   {
      const result = await streamUpload(req.file.buffer); // upload to cloudinary
      req.body[`${req.file.fieldname}`] = result.secure_url; // bo sung them truong "thumbnail",...
                                                             // tùy theo tên người đặt
                                                             // req.body["thumbnail"]
                                                             // req.body["avatar"]
                                                             // ...
      next();
      // res.send("ok");
   }
   else { // neu khong up file thi van cho next qua ham tiep theo o duoi nhu binh thuong
      next();
   }
}

module.exports.uploadFields = async (req, res, next) => 
{
   // if(req.files) // ko can nua, doc ky code o vong for se hieu
   // {
      for(const key in req.files) 
      {
         req.body[key] = [];
   
         const correspondArray = req.files[key];
   
         for(const eachFile of correspondArray) {
            const result = await streamUpload(eachFile.buffer); // upload to cloudinary
                                                                // then we can get the url of that file
            req.body[key].push(result.secure_url); // bo sung them truong "thumbnail",...
                                            // tùy theo tên người đặt
                                            // req.body["thumbnail"]
                                            // req.body["avatar"]
                                            // ...
         }
      }

      next();
   // }
   // else { // neu khong up file thi van cho next qua ham tiep theo o duoi nhu binh thuong
   //    next();
   // }
}