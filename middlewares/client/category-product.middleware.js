const ProductCategoryModel = require("../../models/product-category.model");
const createHierarchyHelper = require("../../helpers/createHierarchy.helper");

module.exports.categoryProduct = async (request, response, next) =>
{
   const listProductCategories = await ProductCategoryModel.find(
      {
         deleted: false,
         status: "active"
      }
   );

   const hierarchyCategories = createHierarchyHelper(listProductCategories);
   response.locals.layoutProductCategories = hierarchyCategories; // pug files that have this middleware can use this variable "layoutProductCatogries"

   next();
}