const express = require("express");
const multer  = require('multer');
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerAdmin = require("../../controllers/admin/upload.controller.js");
const functionsUploadFileToCloud = require("../../middlewares/admin/uploadCloud.middleware.js");

// ------ Upload 1 file
const upload = multer();
// ----- End upload 1 file

router.post(
   "/",
   upload.single("file"), // de up anh tu frontend len ung dung backend nodejs
   functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary 
   controllerAdmin.uploadMCEImageToCloud
);

module.exports = router;