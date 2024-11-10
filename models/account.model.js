const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
   {
      fullName: String,
      email: String,
      phone: String,
      // link Facebook: ...
      password: String,
      token: String,
      // avatar: String, // only save image link, the image is uploaded on cloud
      avatar: Array,
      role_id: String,
      status: String,
      deleted: {
         type: Boolean,
         default: false
      },
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const AccountModel = mongoose.model("Account", accountSchema, "accounts");

module.exports = AccountModel;