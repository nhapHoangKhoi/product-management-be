const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productCategorySchema = new mongoose.Schema(
   {
      title: String,
      parent_id: {
         type: String,
         default: ""
      },
      description: String,
      // thumbnail: String, // khi project chinh thuc se bo cai nay,
      status: String,
      position: Number,
      createdBy: String,
      updatedBy: String,
      deleted: {
         type: Boolean,
         default: false
      },
      deletedBy: String, // deletedAt === updatedAt
      slug: {
         type: String,
         slug: "title", // tu dong render slug theo truong title
         unique: true
      }
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const ProductCategoryModel = mongoose.model("ProductCategory", productCategorySchema, "product-categories");

module.exports = ProductCategoryModel;