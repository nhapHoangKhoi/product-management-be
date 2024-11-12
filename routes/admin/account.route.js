const express = require("express");
const multer  = require('multer');
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerAdmin = require("../../controllers/admin/account.controller.js");
const functionsUploadFileToCloud = require("../../middlewares/admin/uploadCloud.middleware.js");
const validate = require("../../validates/admin/account.validate.js");

// ------ Upload 1 file
const upload = multer();
// ----- End upload 1 file

router.get("/", controllerAdmin.index);
router.patch("/change-status/:statusChange/:idAccountAmdin", controllerAdmin.changeStatus);

router.get("/create", controllerAdmin.getCreatePage);
// ----- Old
// router.post(
//    "/create", 
//    upload.single("avatar"), // de up anh tu frontend len ung dung backend nodejs
//    functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary
//    validate.createAccountAdmin,
//    controllerAdmin.createAccountAdmin
// );
// ----- End old
// ----- New
router.post(
   "/create", 

   // upload image from frontend to backend nodejs
   upload.fields(
      [
         {
            name: "avatar",
            maxCount: 1
         }
      ]
   ), 
   functionsUploadFileToCloud.uploadFields, // upload image from backend nodejs to cloudinary
   validate.createAccountAdmin,
   controllerAdmin.createAccountAdmin
);
// ----- End new

router.get("/edit/:idAccount", controllerAdmin.getEditPage);
// // ----- Old
// router.patch(
//    "/edit/:idAccount", 
//    upload.single("avatar"), // de up anh tu frontend len ung dung backend nodejs
//    functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary
//    validate.editAccountAdmin,
//    controllerAdmin.editAccountAdmin
// );
// // ----- End old
// ----- New
router.patch(
   "/edit/:idAccount", 

   // upload image from frontend to backend nodejs
   upload.fields(
      [
         {
            name: "avatar",
            maxCount: 1
         }
      ]
   ), 
   functionsUploadFileToCloud.uploadFields, // upload image from backend nodejs to cloudinary
   validate.editAccountAdmin,
   controllerAdmin.editAccountAdmin
);
// ----- End new

router.delete("/delete-permanent/:idAdmin", controllerAdmin.permanentDeleteAdmin);
router.delete("/delete-many-permanent", controllerAdmin.permanentDeleteManyAdmins);

module.exports = router;