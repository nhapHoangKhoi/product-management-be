const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controllerDashboard = require("../../controllers/admin/dashboard.controller.js");

router.get("/", controllerDashboard.index);

module.exports = router;