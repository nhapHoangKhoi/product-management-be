const express = require("express");
const multer  = require('multer');
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerAdmin = require("../../controllers/admin/setting.controller.js");

// ------ Upload 1 file
const upload = multer();
const functionsUploadFileToCloud = require("../../middlewares/admin/uploadCloud.middleware.js");
// ----- End upload 1 file

router.get("/general", controllerAdmin.getGeneralSettingPage);
// ----- Old
// router.patch(
//    "/general", 
//    upload.single("logo"), // upload file from frontend to backend nodejs app
//    functionsUploadFileToCloud.uploadSingleFile, // upload file from backend nodejs to cloudinary
//    // validate.createProduct, 
//    controllerAdmin.settingGeneral
// );
// ----- End old
// ----- New
router.patch(
   "/general", 

   // de up anh tu frontend len ung dung backend nodejs
   upload.fields(
      [
         {
            name: "logo",
            maxCount: 1
         }
      ]
   ), 
   functionsUploadFileToCloud.uploadFields, // de up anh tu backend nodejs len cloudinary
   // validate.createProduct, 
   controllerAdmin.settingGeneral
);
// ----- End new

module.exports = router;