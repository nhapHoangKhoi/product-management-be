const ProductModel = require("../../models/product.model");

// ----------------[]------------------- //
// [GET] /
module.exports.index = async (request, response) => 
{
   // ----- Get featured products ----- //
   const productsFeatured = await ProductModel
      .find(
         {
            featured: "yes",
            status: "active",
            deleted: false
         }
      )
      .sort(
         {
            position: "desc"
         }
      )
      .limit(6)
      .select("-description");

   // ----- Calculate and add new key "priceNew" ----- //
   for(aProduct of productsFeatured) {
      aProduct.priceNew = (aProduct.price - (aProduct.price * aProduct.discountPercentage/100)).toFixed(0);
   }
   // ----- End calculate and add new key "priceNew" ----- //
   // ----- End get featured products ----- //


   // ----- Get newest products ----- //
   const productsNewest = await ProductModel
      .find(
         {
            status: "active",
            deleted: false
         }
      )
      .sort(
         {
            position: "desc"
         }
      )
      .limit(6)
      .select("-description");

   // ----- Calculate and add new key "priceNew" ----- //
   for(aProduct of productsNewest) {
      aProduct.priceNew = (aProduct.price - (aProduct.price * aProduct.discountPercentage/100)).toFixed(0);
   }
   // ----- End calculate and add new key "priceNew" ----- //
   // ----- End get newest products ----- //

   
   response.render(
      "client/pages/home/index.pug", 
      {
         pageTitle: "Home Page",
         productsFeatured: productsFeatured,
         productsNewest: productsNewest
      }
   );
}
// ----------------End []------------------- //