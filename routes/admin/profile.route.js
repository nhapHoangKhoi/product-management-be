const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerAdmin = require("../../controllers/admin/profile.controller.js");

router.get("/", controllerAdmin.index);

module.exports = router;