const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerHome = require("../../controllers/client/home.controller.js");

router.get("/", controllerHome.index);

module.exports = router;