const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
   {
      fullName: String,
      email: String,
      phone: String,
      // link Facebook: ...
      password: String,
      tokenUser: String,
      // avatar: String, // only save image link, the image is uploaded on cloud
                         // not used yet
      status: {
         type: String,
         default: "active" // "initial", "active", "inactive",...
      },
      deleted: {
         type: Boolean,
         default: false
      },
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const UserModel = mongoose.model("User", userSchema, "users");

module.exports = UserModel;