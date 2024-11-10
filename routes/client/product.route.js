const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controller = require("../../controllers/client/product.controller.js");

// giong nhu noi chuoi
router.get("/", controller.index);
router.get("/:slugCategory", controller.getProductsByCategory)

router.get("/detail/:slug", controller.getDetailPage);

module.exports = router;