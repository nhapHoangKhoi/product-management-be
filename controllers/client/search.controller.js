const ProductModel = require("../../models/product.model");

const unidecode = require('unidecode');

// ----------------[]------------------- //
// [GET] /search/
module.exports.getSearchPage = async (request, response) => 
{
   const itemFind = {
      status: "active",
      deleted: false
   };
   
   
   // ----- Search products (co ban) ----- //
   // const keyword = request.query.inputKeyword;
   // if(keyword) {
   //    const regex = new RegExp(request.query.inputKeyword, "i");
   //    itemFind.title = regex;

   //    listProducts = await ProductModel.find(itemFind);

   //    // ----- Calculate and add new key "priceNew" ----- //
   //    for(aProduct of listProducts) {
   //       aProduct.priceNew = (aProduct.price - (aProduct.price * aProduct.discountPercentage/100)).toFixed(0);
   //    }
   //    // ----- End calculate and add new key "priceNew" ----- //
   // }
   // ----- End search products (co ban) ----- //


   // ----- Search products (nang cao) ----- //
   let keyword = request.query.inputKeyword || "";
   if(keyword) {
      let keywordSlug = keyword.trim(); // bo cac khoang trang o 2 dau
      keywordSlug = keywordSlug.replace(/\s/g, "-");
      keywordSlug = keywordSlug.replace(/-+/g, "-");
      
      keywordSlug = unidecode(keywordSlug);
      // console.log(keyword); // cắt doi
      // console.log(keywordSlug); // cat-doi

      const regexKeyword = new RegExp(keyword, "i");
      const regexKeywordSlug = new RegExp(keywordSlug, "i");

      itemFind.$or = [
         { title: regexKeyword },
         { slug: regexKeywordSlug }
      ];
   }
   // ----- End search products (nang cao) ----- //


   const listProducts = await ProductModel.find(itemFind);

   // ----- Calculate and add new key "priceNew" ----- //
   for(aProduct of listProducts) {
      aProduct.priceNew = (aProduct.price - (aProduct.price * aProduct.discountPercentage/100)).toFixed(0);
   }
   // ----- End calculate and add new key "priceNew" ----- //

   response.render(
      "client/pages/search/index.pug", 
      {
         pageTitle: "Tìm kiếm",
         inputKeyword: keyword,
         listProducts: listProducts
      }
   );
}

// [GET] /search/suggest
module.exports.getSuggestions = async (request, response) =>
{
   const itemFind = {
      deleted: false,
      status: "active"
   };

   // ----- Search products (nang cao) ----- //
   let keyword = request.query.inputKeyword || "";
   let listOfProducts = [];

   if(keyword) {
      let keywordSlug = keyword.trim(); // bo cac khoang trang o 2 dau
      keywordSlug = keywordSlug.replace(/\s/g, "-");
      keywordSlug = keywordSlug.replace(/-+/g, "-");
      
      keywordSlug = unidecode(keywordSlug);
      // console.log(keyword); // cắt doi
      // console.log(keywordSlug); // cat-doi

      const regexKeyword = new RegExp(keyword, "i");
      const regexKeywordSlug = new RegExp(keywordSlug, "i");

      itemFind.$or = [
         { title: regexKeyword },
         { slug: regexKeywordSlug }
      ];

      listOfProducts = await ProductModel.find(itemFind);
   }
   // ----- End search products (nang cao) ----- //

   
   // ----- Code api, needs to be cared of what data be returned ----- //
   const listFinalSuggestions = [];
   
   for(const item of listOfProducts) 
   {
      const itemFinal = {
         title: item.title,
         slug: item.slug,
         thumbnail: (item.images.length > 0 ? item.images[0] : "")
      };

      listFinalSuggestions.push(itemFinal);
   }
   // ----- End code api, needs to be cared of what data be returned ----- //

   response.json(
      {
         code: 200,
         suggestions: listFinalSuggestions
      }
   );
}
// ----------------End []------------------- //