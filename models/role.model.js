const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
   {
      title: String,
      description: String,
      permissions: {
         type: Array,
         default: []
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

const RoleModel = mongoose.model("Role", roleSchema, "roles");

module.exports = RoleModel;