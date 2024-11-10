const express = require("express");
const multer  = require('multer');
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerAdmin = require("../../controllers/admin/product-category.controller.js");
const validate = require("../../validates/admin/product-category.validate.js");
const functionsUploadFileToCloud = require("../../middlewares/admin/uploadCloud.middleware.js");

// ------ Upload 1 file
const upload = multer();
// ----- End upload 1 file

// /product-categories
router.get("/", controllerAdmin.index);
router.patch("/change-status/:statusChange/:idCategory", controllerAdmin.changeStatus);
router.patch("/change-multi", controllerAdmin.changeMulti);
router.patch("/delete/:idCategory", controllerAdmin.softDeleteCategory);
router.patch("/change-position/:idCategory", controllerAdmin.changePosition);

router.get("/create", controllerAdmin.getCreatePage);
router.post(
   "/create",
   upload.single("thumbnail"), // de up anh tu frontend len ung dung backend nodejs
   functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary 
   validate.createCategory,
   controllerAdmin.createCategory
);

router.get("/edit/:idCategory", controllerAdmin.getEditPage);
router.patch(
   "/edit/:idCategory", 
   upload.single("thumbnail"), // de up anh tu frontend len ung dung backend nodejs
   functionsUploadFileToCloud.uploadSingleFile, // de up anh tu backend nodejs len cloudinary
   validate.createCategory, 
   controllerAdmin.editCategory
);

router.get("/trash", controllerAdmin.getDeletedCategories);
router.patch("/recover/:idCategory", controllerAdmin.recoverCategory);
router.patch("/recover-many", controllerAdmin.recoverManyCategories);
router.delete("/delete-permanent/:idCategory", controllerAdmin.permanentDeleteCategory);
router.delete("/delete-many-permanent", controllerAdmin.permanentDeleteManyCategories);

module.exports = router;