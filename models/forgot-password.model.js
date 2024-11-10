const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema(
   {
      email: String,
      otp: String,
      "expireAt": { 
         type: Date,  
         expires: 0 // automatically delete the document after 0 seconds
      }
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const ForgotPasswordModel = mongoose.model("ForgotPassword", forgotPasswordSchema, "forgot-password");

module.exports = ForgotPasswordModel;