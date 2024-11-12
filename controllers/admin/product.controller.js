const ProductModel = require("../../models/product.model.js");
const ProductCategoryModel = require("../../models/product-category.model.js");
const AccountModel = require("../../models/account.model.js");

const systemConfigs = require("../../config/system.js");
const paginationHelper = require("../../helpers/pagination.helper.js");
const createHierarchyHelper = require("../../helpers/createHierarchy.helper.js");
const moment = require("moment");
const unidecode = require('unidecode');

// ----------------[]------------------- //
// [GET] /admin/products/
module.exports.index = async (request, response) => 
{
   const productFind = {
      deleted: false
   };

   
   // ----- Filter by status ----- //
   // {status: "active"}
   // {status: "inactive"}
   // {status: undefined}
   if(request.query.status) {
      productFind.status = request.query.status;
   }
   const filterStatusForFE = [
      {
         label: "All",
         value: ""
      },
      {
         label: "Active",
         value: "active"
      },
      {
         label: "Inactive",
         value: "inactive"
      }
   ];
   // ----- End filter by status ----- //


   // ----- Sort ----- //
   const productSortBy = {
      // position: "desc",
      // price: "desc",
      // title: "asc"
   };

   // vi du : sortKey=price&sortValue=desc
   const sortKey = request.query.sortKey;
   const sortValue = request.query.sortValue;

   if(sortKey && sortValue) 
   {
      productSortBy[sortKey] = sortValue; // title=desc, price=desc,...
   }
   else {
      productSortBy.position = "desc"; // default if no other sort request
   }
   // ----- End sort ----- //


   // ----- Search products ----- //
   // let keyword = "";
   // if(request.query.inputKeyword) {
   //    const regex = new RegExp(request.query.inputKeyword, "i");
   //    productFind.title = regex;
   //    keyword = request.query.inputKeyword;
   // }
   // ----- End search products ----- //


   // ----- Search products ----- //
   let keyword = request.query.inputKeyword || "";
   if(keyword) {
      let keywordSlug = keyword.trim(); // remvove white-spaces at 2 ends
      keywordSlug = keywordSlug.replace(/\s/g, "-");
      keywordSlug = keywordSlug.replace(/-+/g, "-");
      
      keywordSlug = unidecode(keywordSlug);
      // console.log(keyword); // cắt doi
      // console.log(keywordSlug); // cat-doi

      const listKeywords = keyword.split(/\s+/).map(word => {
         return word.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&'); // escape special characters
      });

      const regexKeyword = new RegExp(listKeywords.join(".*"), "i"); // ".*" allows for any characters in between
      const regexKeywordSlug = new RegExp(keywordSlug, "i");

      productFind.$or = [
         { title: regexKeyword },
         { slug: regexKeywordSlug }
      ];
   }
   // ----- End search products ----- //


   // ----- Pagination ----- //
   const itemsLimited = 4;
   const pagination = await paginationHelper.paging(request, productFind, itemsLimited, ProductModel); // { currentPage: 1, itemsLimited: 4, startIndex: 0, totalPage: 5 }
   // ----- End pagination -----//


   const listOfProducts = await ProductModel
      .find(productFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex)
      .sort(productSortBy);

   // Because the field "createdBy", "updatedBy" in database only stores the id of that person 
   for(const eachProduct of listOfProducts) 
   {
      // -- Person created -- //
      if(eachProduct.createdBy) {
         const accountCreated = await AccountModel.findOne(
            {
               _id: eachProduct.createdBy
            }
         );
   
         eachProduct.createdBy_FullName = accountCreated.fullName;
      }
      else {
         eachProduct.createdBy_FullName = "";
      }

      eachProduct.createdAt_Format = moment(eachProduct.createdAt).format("DD/MM/YYYY HH:mm:ss"); // format day, time
      // -- End person created -- //


      // -- Person updated -- //
      if(eachProduct.updatedBy) {
         const accountUpdated = await AccountModel.findOne(
            {
               _id: eachProduct.updatedBy
            }
         );
   
         eachProduct.updatedBy_FullName = accountUpdated.fullName;
      }
      else {
         eachProduct.updatedBy_FullName = "";
      }
      
      eachProduct.updatedAt_Format = moment(eachProduct.updatedAt).format("DD/MM/YYYY HH:mm:ss"); // format day, time
      // -- End person updated -- //
   }

   response.render(
      "admin/pages/products/index.pug", 
      {
         pageTitle: "Product Management",
         listOfProducts: listOfProducts,
         keyword: keyword,
         filterStatusForFE: filterStatusForFE,
         pagination: pagination
      }
   );
}

// [GET] /admin/products/suggest
module.exports.getSuggestions = async (request, response) =>
{
   const productFind = {
      deleted: false
   };

   // ----- Search products ----- //
   let keyword = request.query.keyword || "";
   let listOfProducts = [];

   if(keyword) {
      let keywordSlug = keyword.trim(); // remvove white-spaces at 2 ends
      keywordSlug = keywordSlug.replace(/\s/g, "-");
      keywordSlug = keywordSlug.replace(/-+/g, "-");
      
      keywordSlug = unidecode(keywordSlug);
      // console.log(keyword); // cắt doi
      // console.log(keywordSlug); // cat-doi

      const listKeywords = keyword.split(/\s+/).map(word => {
         return word.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&'); // escape special characters
      });

      const regexKeyword = new RegExp(listKeywords.join(".*"), "i"); // ".*" allows for any characters in between
      const regexKeywordSlug = new RegExp(keywordSlug, "i");

      productFind.$or = [
         { title: regexKeyword },
         { slug: regexKeywordSlug }
      ];

      listOfProducts = await ProductModel.find(productFind);
   }
   // ----- End search products ----- //

   
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

// [GET] /admin/products/detail/:idProduct
module.exports.getDetailPage = async (request, response) =>
{
   try {
      const productId = request.params.idProduct;

      const productFind = {
         _id: productId,
         deleted: false
      };
   
      const theProductData = await ProductModel.findOne(productFind); 

      if(theProductData) // check != null, because rendering out the interface, so add these if else
      {
         response.render(
            "admin/pages/products/detail.pug",
            {
               pageTitle: "Product detail",
               theProductData: theProductData
            }
         );
      }
      else 
      {
         response.redirect(`/${systemConfigs.prefixAdmin}/products`);
      }
   }
   catch(error) {
      // catch: hack
      // console.log(error)
      request.flash("error", "ID not valid!");
      response.redirect(`/${systemConfigs.prefixAdmin}/products`);
   }
}

// [PATCH] /admin/products/change-status/:statusChange/:idProduct
module.exports.changeStatus = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_edit"))
   {
      try {
         const { idProduct, statusChange } = request.params; // { statusChange: '...', idProduct: '...' }
         
         // update data in the database
         // mongoose, not related anything to GET, PATCH,...
         await ProductModel.updateOne(
            {
               _id: idProduct
            }, 
            {
               status: (statusChange == "active") ? "inactive" : "active",
               updatedBy: response.locals.accountAdmin.id
            }
         );
      
         request.flash("success", "Update status successfully!"); // just key name "success"
   
         response.json(
            {
               code: 200
            }
         );
      } 
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_edit") || 
      response.locals.correspondRole.permissions.includes("products_delete"))
   {
      // console.log(request.body);
      // {
      //    selectedValue: 'active',
      //    listOfIds: [ '66f972ce307bea1ebe5e8fe5', '66f972ce307bea1ebe5e8fe6' ]
      // }
   
      const { selectedValue, listOfIds } = request.body;
   
      switch(selectedValue)
      {
         case "active":
         case "inactive":
            if(response.locals.correspondRole.permissions.includes("products_edit")) {
               await ProductModel.updateMany(
                  {
                     _id: listOfIds
                  }, 
                  {
                     status: selectedValue,
                     updatedBy: response.locals.accountAdmin.id
                  }
               );
               request.flash("success", "Update successfully!");
            }
            break;
   
         case "deleteSoftManyItems":
            if(response.locals.correspondRole.permissions.includes("products_delete")) {
               await ProductModel.updateMany(
                  {
                     _id: listOfIds
                  },
                  {
                     deleted: true,
                     deletedBy: response.locals.accountAdmin.id
                  }
               );
               request.flash("success", "Delete successfully!");
            }
            break;
         
         default:
            break;
      }
   
      response.json(
         {
            code: 200
         }
      );
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [PATCH] /admin/products/delete/:idProduct
module.exports.softDeleteProduct = async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("products_delete"))
   {
      try {
         const productId = request.params.idProduct;
      
         await ProductModel.updateOne(
            {
               _id: productId
            },
            {
               deleted: true,
               deletedBy: response.locals.accountAdmin.id
            }
         );
      
         request.flash("success", "Delete product successfully!"); // chi la dat ten key "success"
      
         response.json(
            {
               code: 200
            }
         );
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/
      }
   }
   else {
      response.send("403"); // 403 nghia la ko co quyen
   }
}

// [PATCH] /admin/products/change-position/:idProduct
module.exports.changeProductPosition = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_edit"))
   {
      try {
         const productId = request.params.idProduct;
         const itemPosition = request.body.itemPosition;
      
         await ProductModel.updateOne(
            {
               _id: productId
            },
            {
               position: itemPosition,
               updatedBy: response.locals.accountAdmin.id
            }
         );
      
         response.json(
            {
               code: 200
            }
         );
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/products/create
module.exports.getCreatePage = async (request, response) =>
{
   // ----- Hierarchy dropdown ----- //
   const allCategoriesFind = {
      deleted: false
   };
   const listOfCategories = await ProductCategoryModel.find(allCategoriesFind); 
   
   const hierarchyCategories = createHierarchyHelper(listOfCategories);
   // ----- End hierarchy dropdown ----- //
   
   
   response.render(
      "admin/pages/products/create.pug",
      {
         pageTitle: "Create New Product",
         listOfCategories: hierarchyCategories
      }
   );
}

// [POST] /admin/products/create
module.exports.createProduct = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_create")) 
   {
      // ----- Make sure the data type is correct with the Model : Number, String,... ----- //
      request.body.price = parseFloat(request.body.price);
      request.body.discountPercentage = parseFloat(request.body.discountPercentage);
      request.body.stock = parseInt(request.body.stock);
      
      if(request.body.position) {
         request.body.position = parseInt(request.body.position);
      }
      else {
         // --- Cach 1 (not use anymore)
         // const numberOfProducts = await ProductModel.countDocuments({});
         // request.body.position = numberOfProducts + 1;
         // --- End cach lam 1 (not use anymore)

         // --- Cach lam 2
         const productWithMaxPosition = await ProductModel
            .findOne({})
            .sort(
               {
                  position: -1
               }
            );

         request.body.position = productWithMaxPosition.position + 1;
         // --- End cach lam 2
      }

      // add field "createdBy"
      request.body.createdBy = response.locals.accountAdmin.id;
      // End add field "createdBy"
      // ----- End make sure the data type is correct with the Model : Number, String,... ----- //
   
      
      const newProductModel = new ProductModel(request.body);
      await newProductModel.save();
   
      request.flash("success", "Create new product successfully!");
      response.redirect(`/${systemConfigs.prefixAdmin}/products`);
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/products/edit/:idProduct
module.exports.getEditPage = async (request, response) =>
{
   try {
      const productId = request.params.idProduct;

      const productFind = {
         _id: productId,
         deleted: false
      };
   
      const theProductData = await ProductModel.findOne(productFind); 

      if(theProductData) // check != null, because rendering out the interface, so add these if else
      {
         // ----- Hierarchy dropdown ----- //
         const allCategoriesFind = {
            deleted: false
         };
         const listOfCategories = await ProductCategoryModel.find(allCategoriesFind); 
         const hierarchyCategories = createHierarchyHelper(listOfCategories);
         // ----- End hierarchy dropdown ----- //

         response.render(
            "admin/pages/products/edit.pug",
            {
               pageTitle: "Edit Product",
               theProductData: theProductData,
               listOfCategories: hierarchyCategories
            }
         );
      }
      else 
      {
         response.redirect(`/${systemConfigs.prefixAdmin}/products`);
      }
   }
   catch(error) {
      // catch: hack
      // console.log(error)
      request.flash("error", "ID not valid!");
      response.redirect(`/${systemConfigs.prefixAdmin}/products`);
   }
}

// [PATCH] /admin/products/edit/:idProduct
module.exports.editProduct = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_edit"))
   {
      try {
         const productId = request.params.idProduct;
      
         // ----- Make sure the data type is correct with the Model : Number, String,... ----- //
         request.body.price = parseFloat(request.body.price);
         request.body.discountPercentage = parseFloat(request.body.discountPercentage);
         request.body.stock = parseInt(request.body.stock);
         
         if(request.body.position) {
            request.body.position = parseInt(request.body.position);
         }
         else {
            const numberOfProducts = await ProductModel.countDocuments({});
            request.body.position = numberOfProducts + 1;
         }

         // add field "createdBy"
         request.body.updatedBy = response.locals.accountAdmin.id;
         // End add field "createdBy"

         if(!request.body.images) {
            request.body.images = [];
         }
         // ----- End make sure the data type is correct with the Model : Number, String,... ----- //
   
         
         await ProductModel.updateOne(
            {
               _id: productId
            },
            request.body
         );
      
         request.flash("success", "Edit product successfully!");
      }
      catch(error) {
         request.flash("error", "ID not valid!");
      }
   
      // response.send("OK Frontend");
      response.redirect("back"); // go back to [GET] /admin/products/edit
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/products/trash
module.exports.getDeletedProducts = async (request, response) =>
{
   const deletedProductFind = {
      deleted: true
   };

   // ----- Pagination ----- //
   const limitItems = 10;
   const pagination = await paginationHelper.paging(request, deletedProductFind, limitItems, ProductModel); // { currentPage: 1, limitItems: 10, startIndex: 0, totalPage:... }
   // ----- End pagination -----//
   

   const listOfDeletedProducts = await ProductModel
      .find(deletedProductFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex);

   // Because the field "deletedBy" in database only stores the id of that person 
   for(const eachProduct of listOfDeletedProducts) 
   {
      // -- Person deleted soft -- //
      if(eachProduct.deletedBy) {
         const accountDeleted = await AccountModel.findOne(
            {
               _id: eachProduct.deletedBy
            }
         );
   
         eachProduct.deletedBy_FullName = accountDeleted.fullName;
      }
      else {
         eachProduct.deletedBy_FullName = "";
      }

      eachProduct.deletedAt_Format = moment(eachProduct.updatedAt).format("DD/MM/YYYY HH:mm:ss"); // format day, time
      // -- End person deleted soft -- //
   }

   response.render(
      "admin/pages/products/trash.pug",
      {
         listOfDeletedProducts: listOfDeletedProducts,
         pagination: pagination
      }
   );
}

// [PATCH] /admin/products/recover/:idProduct
module.exports.recoverProduct = async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("products_delete"))
   {
      try {
         const productId = request.params.idProduct;
      
         await ProductModel.updateOne(
            {
               _id: productId
            },
            {
               deleted: false,
               updatedBy: response.locals.accountAdmin.id
            }
         );
      
         request.flash("success", "Recover succesfully!"); // key name "success"
      
         response.json(
            {
               code: 200
            }
         );
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/trash
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [PATCH] /admin/products/recover-many
module.exports.recoverManyProducts = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "recoverManyItems") {
         await ProductModel.updateMany(
            {
               _id: listOfIds
            },
            {
               deleted: false,
               updatedBy: response.locals.accountAdmin.id
            }
         );

         request.flash("success", "Recover successfully!"); // key name "success"

         response.json(
            {
               code: 200
            }
         );
      }
   
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [DELETE] /admin/products/delete-permanent/:idProduct
module.exports.permanentDeleteProduct = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_delete"))
   {
      try {
         const productId = request.params.idProduct;
      
         await ProductModel.deleteOne(
            {
               _id: productId
            }
         );
      
         response.json(
            {
               code: 200
            }
         );
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/trash
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission 
   }
}

// [DELETE] /admin/products/delete-many-permanent
module.exports.permanentDeleteManyProducts = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("products_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "deletePermanentManyItems") {
         await ProductModel.deleteMany(
            {
               _id: listOfIds
            }
         );

         response.json(
            {
               code: 200
            }
         );
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ----------------End []------------------- //