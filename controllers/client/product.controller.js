const ProductCategoryModel = require("../../models/product-category.model.js");
const ProductModel = require("../../models/product.model.js");

const paginationHelper = require("../../helpers/pagination.helper.js");

// ----------------[]------------------- //
// [GET] /products/
module.exports.index = async (request, response) => 
{
   const productFind = {
      deleted: false,
      status: "active"
   };


   // ----- Pagination ----- //
   const itemsLimited = 9;
   const pagination = await paginationHelper.paging(request, productFind, itemsLimited, ProductModel); // { currentPage: 1, itemsLimited: 4, startIndex: 0, totalPage: 5 }
   // ----- End pagination -----//


   const listOfProducts = await ProductModel
      .find(productFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex)
      .sort(
         {
            position: "desc"
         }
      )

   // ----- Calculate and add newN key "priceew" ----- //
   for(aProduct of listOfProducts) {
      aProduct.priceNew = (aProduct.price - (aProduct.price * aProduct.discountPercentage/100)).toFixed(0);
   }
   // ----- End calculate and add new key "priceNew" ----- //

   response.render(
      "client/pages/products/index.pug", 
      {
         pageTitle: "Danh sách sản phẩm",
         listOfProducts: listOfProducts,
         pagination: pagination
      }
   );
}

// [GET] /products/:slugCategory
module.exports.getProductsByCategory = async (request, response) => 
{
   const slugCategory = request.params.slugCategory;

   const theCorrespondCategoryData = await ProductCategoryModel.findOne(
      {
         slug: slugCategory,
         status: "active",
         deleted: false
      }
   );


   // ----- Function to get all sub-categories as possible ----- //
   const allSubCategories = [];

   const getSubCategories = async (currentCategoryId) => 
   {
      const subCategoriesInEachLevel = await ProductCategoryModel.find(
         {
            parent_id: currentCategoryId,
            status: "active",
            deleted: false
         }
      );

      for(const eachSubCategory of subCategoriesInEachLevel) {
         allSubCategories.push(eachSubCategory.id);
         await getSubCategories(eachSubCategory.id); // recursive
      }
   }

   await getSubCategories(theCorrespondCategoryData.id);
   // ----- End function to get all sub-categories as possible ----- //


   const productFind = {
      // ----- Get all sub-categories as possible ----- //
      product_category_id: {
         $in: [
            theCorrespondCategoryData.id,
            ...allSubCategories
         ]
      },
      // ----- End get all sub-categories as possible ----- //
      status: "active",
      deleted: false
   }

   // ----- Pagination ----- //
   const itemsLimited = 9;
   const pagination = await paginationHelper.paging(request, productFind, itemsLimited, ProductModel); // { currentPage: 1, itemsLimited: 4, startIndex: 0, totalPage: 5 }
   // ----- End pagination -----//   

   const listOfProducts = await ProductModel
      .find(productFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex)
      .sort(
         {
            position: "desc"
         }
      );

   // ----- Calculate and add new key "priceNew" ----- //
   for(aProduct of listOfProducts) {
      aProduct.priceNew = (aProduct.price - (aProduct.price * aProduct.discountPercentage/100)).toFixed(0);
   }
   // ----- End calculate and add new key "priceNew" ----- //

   response.render(
      "client/pages/products/index.pug", 
      {
         pageTitle: theCorrespondCategoryData.title,
         listOfProducts: listOfProducts,
         pagination: pagination
      }
   );
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /products/detail/:slug
module.exports.getDetailPage = async (request, response) => 
{
   const slug = request.params.slug;
   
   const productFind = {
      slug: slug,
      deleted: false,
      status: "active"
   };

   const theProductData = await ProductModel.findOne(productFind);

   // ----- Calculate and add newN key "priceew" ----- //
   theProductData.priceNew = (theProductData.price - (theProductData.price * theProductData.discountPercentage/100)).toFixed(0);
   // ----- End calculate and add new key "priceNew" ----- //


   // slug la chi co tim duoc hoac khong tim duoc, 
   // chu ko co truong hop bi loi giong id
   //
   // nen chi can if else la du, ko can try catch
   if(theProductData) {
      response.render(
         "client/pages/products/detail.pug", 
         {
            pageTitle: "Chi tiết sản phẩm",
            theProductData: theProductData
         }
      );
   }
   else {
      response.redirect("/"); // chuyen ve trang chu (trang home) [GET] /
   }
}
// ----------------End []------------------- //