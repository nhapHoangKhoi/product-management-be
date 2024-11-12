const express = require("express");
const router = express.Router();

const controllerAdmin = require("../../controllers/admin/authen.controller.js");

router.get("/login", controllerAdmin.getLoginPage);
router.post("/login", controllerAdmin.login);

router.get("/logout", controllerAdmin.logout);

module.exports = router;