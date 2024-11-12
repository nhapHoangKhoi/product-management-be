const express = require("express");
const multer  = require('multer');
const router = express.Router();

const controllerProductAdmin = require("../../controllers/admin/product.controller.js");
const validate = require("../../validates/admin/product.validate.js");
const functionsUploadFileToCloud = require("../../middlewares/admin/uploadCloud.middleware.js");


// ------ Upload 1 file
// ko dung 3 doan code nay nua
//
// const storageMulterHelper = require("../../helpers/storageMulter.helper.js");
// const storage = storageMulterHelper.storage;
// const upload = multer({ storage: storage });
//
const upload = multer();
// ----- End upload 1 file

// /products/
router.get("/", controllerProductAdmin.index);
router.get("/suggest", controllerProductAdmin.getSuggestions);
router.get("/detail/:idProduct", controllerProductAdmin.getDetailPage);
router.patch("/change-status/:statusChange/:idProduct", controllerProductAdmin.changeStatus);
router.patch("/change-multi", controllerProductAdmin.changeMulti);
router.patch("/delete/:idProduct", controllerProductAdmin.softDeleteProduct);
router.patch("/change-position/:idProduct", controllerProductAdmin.changeProductPosition);

router.get("/create", controllerProductAdmin.getCreatePage);
// ----- Old
// router.post(
//    "/create", 
//    upload.single("thumbnail"), // de up anh tu frontend len ung dung backend nodejs
//    functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary
//    validate.createProduct, 
//    controllerProductAdmin.createProduct
// );
// ----- End old
// ----- New
router.post(
   "/create", 

   // upload image from frontend to backend nodejs
   upload.fields(
      [
         {
            name: "images",
            maxCount: 6
         }
      ]
   ), 
   functionsUploadFileToCloud.uploadFields, // upload image from backend nodejs to cloudinary
   validate.createProduct, 
   controllerProductAdmin.createProduct
);
// ----- End new

router.get("/edit/:idProduct", controllerProductAdmin.getEditPage);
// ----- Old
// router.patch(
//    "/edit/:idProduct", 
//    upload.single("thumbnail"), // de up anh tu frontend len ung dung backend nodejs
//    functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary
//    validate.createProduct, 
//    controllerProductAdmin.editProduct
// );
// ----- End old
// ----- New
router.patch(
   "/edit/:idProduct", 

   // upload image from frontend to backend nodejs
   upload.fields(
      [
         {
            name: "images",
            maxCount: 6
         }
      ]
   ), 
   functionsUploadFileToCloud.uploadFields, // upload image from backend nodejs to cloudinary
   validate.createProduct, 
   controllerProductAdmin.editProduct
);
// ----- End new

router.get("/trash", controllerProductAdmin.getDeletedProducts);
router.patch("/recover/:idProduct", controllerProductAdmin.recoverProduct);
router.patch("/recover-many", controllerProductAdmin.recoverManyProducts);
router.delete("/delete-permanent/:idProduct", controllerProductAdmin.permanentDeleteProduct);
router.delete("/delete-many-permanent", controllerProductAdmin.permanentDeleteManyProducts);


module.exports = router;