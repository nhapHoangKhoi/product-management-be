const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
   {
      websiteName: String,
      // logo: String,
      logo: Array,
      phone: String,
      email: String,
      address: String,
      copyright: String
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const SettingModel = mongoose.model("Setting", settingSchema, "settings");

module.exports = SettingModel;