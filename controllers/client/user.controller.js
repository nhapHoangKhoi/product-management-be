const UserModel = require("../../models/user.model.js");
const ForgotPasswordModel = require("../../models/forgot-password.model.js");

const md5 = require("md5");
const generateHelper = require("../../helpers/generate.helper.js");
const sendEmailHelper = require("../../helpers/sendEmail.helper.js");

// ----------------[]------------------- //
// [GET] /user/register
module.exports.getRegisterPage = (request, response) => 
{
   response.render(
      "client/pages/user/register.pug", 
      {
         pageTitle: "Sign up"
      }
   );
}

// [POST] /user/register
module.exports.registerUserAccount = async (request, response) =>
{
   // ----- Check existed email ----- //
   const existedUser = await UserModel.findOne(
      {
         email: request.body.email,
         deleted: false
      }
   );

   if(existedUser) {
      request.flash("error", "Email existed!");
      response.redirect("back"); // go back to page [GET] /user/register
      return;
   }
   // ----- End check existed email ----- //


   const userData = {
      fullName: request.body.fullName,
      email: request.body.email,
      password: md5(request.body.password), // encrypt password
      tokenUser: generateHelper.generateToken(30) // generate random token
   };


   // ----- Store that user data into database ----- //
   const newUserModel = new UserModel(userData);
   await newUserModel.save();
   // ----- End store that user data into database ----- //


   // ----- Store "token" in the cookie of the user ----- //
   const expiredDays = 1 * 24 * 60 * 60 * 1000; // 1 day

   // tra ve token la de xac thuc la nguoi ta da dang nhap thanh cong roi (thay cho buoc dang nhap)
   response.cookie(
      "tokenUser",
      userData.tokenUser,
      { 
         expires: new Date(Date.now() + expiredDays) 
      }
   );
   // ----- End store "token" in the cookie of the user ----- //


   request.flash("success", "Tạo tài khoản mới thành công!");
   response.redirect("/");
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /user/login
module.exports.getLoginPage = (request, response) => 
{
   response.render(
      "client/pages/user/login.pug", 
      {
         pageTitle: "Login"
      }
   );
}

// [POST] /user/login
module.exports.loginUserAccount = async (request, response) =>
{
   const inputEmail = request.body.email;
   const inputPassword = request.body.password;

   const theAccount = await UserModel.findOne(
      {
         email: inputEmail,
         deleted: false
      }
   );

   if(!theAccount) {
      // request.flash("error", "Email không tồn tại!"); // ban chat
      request.flash("error", "Email or password incorrect!");
      response.redirect("back"); // go back to page [GET] /user/login
      return;
   }

   if(md5(inputPassword) != theAccount.password) {
      request.flash("error", "Email or password incorrect!");
      response.redirect("back"); // go back to page [GET] /user/login
      return;
   }

   if(theAccount.status != "active") {
      request.flash("error", "The account is being locked!");
      response.redirect("back"); // go back to page [GET] /user/login
      return;
   }

   // ----- Store "token" in the cookie of the user ----- //
   const expiredDays = 1 * 24 * 60 * 60 * 1000; // 1 days

   response.cookie(
      "tokenUser",
      theAccount.tokenUser,
      { 
         expires: new Date(Date.now() + expiredDays) 
      }
   );
   // ----- End store "token" in the cookie of the user ----- //

   response.redirect("/");
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /user/logout
module.exports.logout = (request, response) =>
{
   response.clearCookie("tokenUser");
   response.redirect("/user/login");
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /user/password/forgot
module.exports.getForgotPasswordPage = (request, response) => 
{
   response.render(
      "client/pages/user/forgot-password.pug", 
      {
         pageTitle: "Forgot Password"
      }
   );
}

// [POST] /user/password/forgot
module.exports.forgotPassword = async (request, response) => 
{
   const inputEmail = request.body.email;

   // ----- Check existed email ----- //
   const existedUser = await UserModel.findOne(
      {
         email: inputEmail,
         deleted: false
      }
   );

   if(!existedUser) {
      request.flash("error", "Email not existed in the system!");
      response.redirect("back"); // go back to page [GET] /user/password/forgot
      return;
   }
   // ----- End check existed email ----- //


   // ----- Buoc 1 : Store email, OTP into database ----- //
   const expireAfter = 3 * 60 * 1000; // 3 minutes (in miliseconds)
   const otp = generateHelper.generateRandomNumber(6);

   const duplicatedForgotEmail = await ForgotPasswordModel.findOne(
      {
         email: inputEmail
      }
   );
   
   if(duplicatedForgotEmail) {
      await ForgotPasswordModel.deleteMany(
         {
            email: inputEmail
         }
      );
   }
   
   const forgotPasswordData = {
      email: inputEmail,
      otp: otp,
      expireAt: Date.now() + expireAfter
   };
   
   const newForgotPasswordModel = new ForgotPasswordModel(forgotPasswordData);
   await newForgotPasswordModel.save();
   // ----- End buoc 1 : Store email, OTP into database ----- //


   // ----- Buoc 2 : Automatically send OTP through user's email ----- //
   const subject = "OTP - Reset password";
   const content = `To verify your email address, please use the following One Time Password (OTP): <b style="color: red;">${otp}</b>. The code is valid for 3 minutes. Do not share this code with anyone.`;

   sendEmailHelper.sendEmail(inputEmail, subject, content);
   // ----- End buoc 2 : Automatically send OTP through user's email ----- //


   // ----- Buoc 3 : Navigate to "type_in_OTP" page ----- // 
   response.redirect(`/user/password/otp?email=${inputEmail}`);
   // ----- Ed buoc 3 : Navigate to "type_in_OTP" page ----- // 
}

// [GET] /user/password/otp
module.exports.getOtpPasswordPage = (request, response) => 
{
   const email = request.query.email;

   response.render(
      "client/pages/user/otp-password.pug", 
      {
         pageTitle: "Verify OTP",
         email: email
      }
   );
}

// [POST] /user/password/otp
module.exports.otpPassword = async (request, response) => 
{
   const email = request.body.email;
   const otp = request.body.otp;

   const comparedData = await ForgotPasswordModel.findOne(
      {
         email: email,
         otp: otp
      }
   );

   if(!comparedData) {
      request.flash("error", "OTP incorrect!");
      response.redirect("back"); // go back to page [GET] /user/password/otp
      return;
   }

   // ----- Return "token" in the cookie of the user ----- //
   const theUser = await UserModel.findOne(
      {
         email: email
      }
   );

   const expiredDays = 1 * 24 * 60 * 60 * 1000; // 1 days

   response.cookie(
      "tokenUser",
      theUser.tokenUser,
      { 
         expires: new Date(Date.now() + expiredDays) 
      }
   );

   response.redirect("/user/password/reset");
   // ----- End return "token" in the cookie of the user ----- //
}

// [GET] /user/password/reset
module.exports.getResetPasswordPage = (request, response) => 
{
   response.render(
      "client/pages/user/reset-password.pug", 
      {
         pageTitle: "Reset Password"
      }
   );
}

// [PATCH] /user/password/reset
module.exports.resetPassword = async (request, response) => 
{
   const newPassword = request.body.password;
   const tokenUser = request.cookies.tokenUser;

   await UserModel.updateOne(
      {
         tokenUser: tokenUser,
         deleted: false
      },
      {
         password: md5(newPassword)
      }
   );

   request.flash("success", "Reset password successfully!");
   response.redirect("/");
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /user/profile
module.exports.getProfilePage = (request, response) => 
{
   response.render(
      "client/pages/user/profile.pug", 
      {
         pageTitle: "Thông tin cá nhân"
      }
   );
}
// ----------------End []------------------- //