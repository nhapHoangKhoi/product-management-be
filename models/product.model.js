const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
   {
      title: String,
      product_category_id: String,
      description: String,
      price: Number,
      discountPercentage: Number,
      stock: Number,
      // thumbnail: String, // khi project chinh thuc se bo cai nay
      images: Array,
      featured: String,
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

const ProductModel = mongoose.model("Product", productSchema, "products");

module.exports = ProductModel;