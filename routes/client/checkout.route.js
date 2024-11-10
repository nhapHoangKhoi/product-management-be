const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controller = require("../../controllers/client/checkout.controller.js");

router.get("/", controller.index);
router.post("/order", controller.order);
router.get("/success/:orderId", controller.getSuccessPage)

module.exports = router;