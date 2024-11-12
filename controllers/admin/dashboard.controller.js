const AccountModel = require("../../models/account.model.js");
const ProductCategoryModel = require("../../models/product-category.model.js");
const ProductModel = require("../../models/product.model.js");
const UserModel = require("../../models/user.model.js");

// [GET] /admin/dashboard/
module.exports.index = async (request, response) => 
{
   const statistics = {
      productCategory: {
         total: 0,
         active: 0,
         inactive: 0
      },
      product: {
         total: 0,
         active: 0,
         inactive: 0
      },
      accountAdmin: {
         total: 0,
         active: 0,
         inactive: 0
      },
      user: {
         total: 0,
         active: 0,
         inactive: 0
      }
   };


   // Statistic productCategory
   statistics.productCategory.total = await ProductCategoryModel.countDocuments(
      {
         deleted: false
      }
   );

   statistics.productCategory.active = await ProductCategoryModel.countDocuments(
      {
         status: "active",
         deleted: false
      }
   );

   statistics.productCategory.inactive = await ProductCategoryModel.countDocuments(
      {
         status: "inactive",
         deleted: false
      }
   );
   // End statistic productCategory


   // Statistic product
   statistics.product.total = await ProductModel.countDocuments(
      {
         deleted: false
      }
   );

   statistics.product.active = await ProductModel.countDocuments(
      {
         status: "active",
         deleted: false
      }
   );

   statistics.product.inactive = await ProductModel.countDocuments(
      {
         status: "inactive",
         deleted: false
      }
   );
   // End statistic product


   // Statistic accountAdmin
   statistics.accountAdmin.total = await AccountModel.countDocuments(
      {
         deleted: false
      }
   );

   statistics.accountAdmin.active = await AccountModel.countDocuments(
      {
         status: "active",
         deleted: false
      }
   );

   statistics.accountAdmin.inactive = await AccountModel.countDocuments(
      {
         status: "inactive",
         deleted: false
      }
   );
   // End statistic accountAmdin


   // Statistic accountClient
   statistics.user.total = await UserModel.countDocuments(
      {
         deleted: false
      }
   );

   statistics.user.active = await UserModel.countDocuments(
      {
         status: "active",
         deleted: false
      }
   );

   statistics.user.inactive = await UserModel.countDocuments(
      {
         status: "inactive",
         deleted: false
      }
   );
   // End statistic accountClient
   

   response.render(
      "admin/pages/dashboard/index.pug", 
      {
         pageTitle: "Dashboard",
         statistics: statistics
      }
   );
}