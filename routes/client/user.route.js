const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controller = require("../../controllers/client/user.controller.js");

router.get("/register", controller.getRegisterPage);
router.post("/register", controller.registerUserAccount);

router.get("/login", controller.getLoginPage);
router.post("/login", controller.loginUserAccount);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.getForgotPasswordPage);
router.post("/password/forgot", controller.forgotPassword);
router.get("/password/otp", controller.getOtpPasswordPage);
router.post("/password/otp", controller.otpPassword);
router.get("/password/reset", controller.getResetPasswordPage);
router.patch("/password/reset", controller.resetPassword);

router.get("/profile", controller.getProfilePage);

module.exports = router;