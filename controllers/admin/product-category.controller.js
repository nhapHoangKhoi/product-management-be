const ProductCategoryModel = require("../../models/product-category.model.js");
const AccountModel = require("../../models/account.model.js");

const systemConfigs = require("../../config/system.js");
const paginationHelper = require("../../helpers/pagination.helper.js");
const createHierarchyHelper = require("../../helpers/createHierarchy.helper.js");
const moment = require("moment");

// ----------------[]------------------- //
// [GET] /admin/product-categories/
module.exports.index = async (request, response) => 
{
   const productCategoryFind = {
      deleted: false
   };

   
   // ----- Filter by status ----- //
   if(request.query.status) {
      productCategoryFind.status = request.query.status;
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
   const itemSortBy = {
      // position: "desc",
      // price: "desc",
      // title: "asc"
   };

   // vi du : sortKey=price&sortValue=desc
   const sortKey = request.query.sortKey;
   const sortValue = request.query.sortValue;

   if(sortKey && sortValue) {
      itemSortBy[sortKey] = sortValue; // title=desc, price=desc,...
   }
   else {
      itemSortBy.position = "asc"; // default if no other sort request
   }
   // ----- End sort ----- //


   // ----- Pagination ----- //
   const itemsLimited = 20;
   const pagination = await paginationHelper.paging(request, productCategoryFind, itemsLimited, ProductCategoryModel); // { currentPage: 1, itemsLimited: 4, startIndex: 0, totalPage: 5 }
   // ----- End pagination -----//


   const listOfCategories = await ProductCategoryModel
      .find(productCategoryFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex)
      .sort(itemSortBy);

   // Because the field "createdBy", "updatedBy" in database only stores the id of that person 
   for(const eachCategory of listOfCategories) 
   {
      // -- Person created -- //
      if(eachCategory.createdBy) {
         const accountCreated = await AccountModel.findOne(
            {
               _id: eachCategory.createdBy
            }
         );
   
         eachCategory.createdBy_FullName = accountCreated.fullName;
      }
      else {
         eachCategory.createdBy_FullName = "";
      }

      eachCategory.createdAt_Format = moment(eachCategory.createdAt).format("DD/MM/YYYY HH:mm:ss"); // format day, time
      // -- End person created -- //


      // -- Person updated -- //
      if(eachCategory.updatedBy) {
         const accountUpdated = await AccountModel.findOne(
            {
               _id: eachCategory.updatedBy
            }
         );
   
         eachCategory.updatedBy_FullName = accountUpdated.fullName;
      }
      else {
         eachCategory.updatedBy_FullName = "";
      }
      
      eachCategory.updatedAt_Format = moment(eachCategory.updatedAt).format("DD/MM/YYYY HH:mm:ss"); // format day, time
      // -- End person updated -- //
   }

   response.render(
      "admin/pages/product-categories/index.pug", 
      {
         pageTitle: "Product Categories",
         listOfCategories: listOfCategories,
         filterStatusForFE: filterStatusForFE,
         pagination: pagination
      }
   );
}

// [PATCH] /admin/product-categories/change-status/:statusChange/:idCategory
module.exports.changeStatus = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_edit"))
   {
      try {
         const { idCategory, statusChange } = request.params; // { statusChange: '...', idProduct: '...' }
         
         // update data in the database
         // mongoose, not related anything to GET, PATCH,...
         await ProductCategoryModel.updateOne(
            {
               _id: idCategory
            }, 
            {
               status: (statusChange == "active") ? "inactive" : "active",
               updatedBy: response.locals.accountAdmin.id
            }
         );
      
         request.flash("success", "Update status successfully!"); // chi la dat ten key "success"
   
         response.json({
            code: 200
         });
      } 
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [PATCH] /admin/product-categories/change-multi
module.exports.changeMulti = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_edit") ||
      response.locals.correspondRole.permissions.includes("product-categories_delete")) 
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
            if(response.locals.correspondRole.permissions.includes("product-categories_edit")) {
               await ProductCategoryModel.updateMany(
                  {
                     _id: listOfIds
                  }, 
                  {
                     status: selectedValue,
                     updatedBy: response.locals.accountAdmin.id
                  }
               );
               request.flash("success", "Update successfully!"); // key named "success"
            }
            break;

         case "deleteSoftManyItems":
            if(response.locals.correspondRole.permissions.includes("product-categories_delete")) {
               await ProductCategoryModel.updateMany(
                  {
                     _id: listOfIds
                  },
                  {
                     deleted: true,
                     deletedBy: response.locals.accountAdmin.id
                  }
               );
               request.flash("success", "Delete successfully!"); // key named "success"
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

// [PATCH] /admin/product-categories/delete/:idCategory
module.exports.softDeleteCategory= async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("product-categories_delete"))
   {
      try {
         const categoryId = request.params.idCategory;
      
         await ProductCategoryModel.updateOne(
            {
               _id: categoryId
            },
            {
               deleted: true,
               deletedBy: response.locals.accountAdmin.id
            }
         );
      
         request.flash("success", "Delete successfully!"); // key named "success"
      
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

// [PATCH] /admin/product-categories/change-position/:idCategory
module.exports.changePosition = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_edit"))
   {
      try {
         const productCategoryId = request.params.idCategory;
         const itemPosition = request.body.itemPosition;
      
         await ProductCategoryModel.updateOne(
            {
               _id: productCategoryId
            },
            {
               position: itemPosition,
               updatedBy: response.locals.accountAdmin.id
            }
         );
      
         response.json({
            code: 200
         });
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/products/
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ---------------End []------------------ //


// ----------------[]------------------- //
// [GET] /admin/product-categories/create
module.exports.getCreatePage = async (request, response) =>
{
   const productCategoryFind = {
      deleted: false
   };


   const listOfCategories = await ProductCategoryModel.find(productCategoryFind); 

   // ----- Hierarchy dropdown ----- //
   const hierarchyCategories = createHierarchyHelper(listOfCategories);
   // ----- End hierarchy dropdown ----- //


   response.render(
      "admin/pages/product-categories/create.pug", 
      {
         pageTitle: "Create New Product Category",
         listOfCategories: hierarchyCategories
      }
   );
}

// [POST] /admin/product-categories/create
module.exports.createCategory = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_create")) 
   {
      // ----- Make sure the data type is correct with the Model : Number, String,... ----- //   
      if(request.body.position) {
         request.body.position = parseInt(request.body.position);
      }
      else {
         // --- Cach 1 (not use anymore)
         // const numberOfCategories = await ProductCategoryModel.countDocuments({});
         // request.body.position = numberOfCategories + 1;
         // --- End cach 1 (not use anymore)

         // --- Cach lam 2
         const productCategoryWithMaxPosition = await ProductCategoryModel
         .findOne({})
         .sort(
            {
               position: -1
            }
         );

         request.body.position = productCategoryWithMaxPosition.position + 1;
         // --- End cach lam 2
      }

      // add field "createdBy"
      request.body.createdBy = response.locals.accountAdmin.id;
      // End add field "createdBy"
      // ----- End make sure the data type is correct with the Model : Number, String,... ----- //
   
      
      const newCategoryModel = new ProductCategoryModel(request.body);
      await newCategoryModel.save();
   
      request.flash("success", "Create new product category successfully!");
      response.redirect(`/${systemConfigs.prefixAdmin}/product-categories`);
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ---------------End []------------------ //


// ----------------[]------------------- //
// [GET] /admin/product-categories/edit/:idCategory
module.exports.getEditPage = async (request, response) =>
{
   try {
      // ----- Data of the specific category ----- //
      const categoryId = request.params.idCategory;
      
      const theCategoryFind = {
         _id: categoryId,
         deleted: false
      };
      const theCategoryData = await ProductCategoryModel.findOne(theCategoryFind);
      // ----- End data of the specific category ----- //


      // ----- Hierarchy dropdown ----- //
      const allCategoriesFind = {
         deleted: false
      };
      const listOfCategories = await ProductCategoryModel.find(allCategoriesFind); 
      const hierarchyCategories = createHierarchyHelper(listOfCategories);
      // ----- End hierarchy dropdown ----- //
   
      
      if(hierarchyCategories) // check != null, because rendering out the interface, so add these if else
      {
         response.render(
            "admin/pages/product-categories/edit.pug", 
            {
               pageTitle: "Edit Product Category",
               listOfCategories: hierarchyCategories,
               theCategoryData: theCategoryData
            }
         );
      }
      else 
      {
         response.redirect(`/${systemConfigs.prefixAdmin}/product-categories`);
      }
   }
   catch(error) {
      // catch: hack
      // console.log(error)
      request.flash("error", "ID not valid!");
      response.redirect(`/${systemConfigs.prefixAdmin}/product-categories`);
   }
}

// [PATCH] /admin/product-categories/edit/:idCategory
module.exports.editCategory = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_edit"))
   {
      try {
         const categoryId = request.params.idCategory;
   
         // ----- Make sure the data type is correct with the Model : Number, String,... ----- //   
         if(request.body.position) {
            request.body.position = parseInt(request.body.position);
         }
         else {
            const numberOfCategories = await ProductCategoryModel.countDocuments({});
            request.body.position = numberOfCategories + 1;
         }

         // add field "updatedBy"
         request.body.updatedBy = response.locals.accountAdmin.id;
         // End add field "updatedBy"
         // ----- End make sure the data type is correct with the Model : Number, String,... ----- //
   
         await ProductCategoryModel.updateOne(
            {
               _id: categoryId
            },
            request.body
         );
      
         request.flash("success", "Update successfully!");
      }
      catch(error) {
         request.flash("error", "ID not valid!");
      }
   
      // response.send("OK Frontend");
      response.redirect("back"); // back to page [GET] /admin/product-categories/edit
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}
// ---------------End []------------------ //


// ----------------[]------------------- //
// [GET] /admin/product-categories/trash
module.exports.getDeletedCategories = async (request, response) =>
{
   const deletedCategoriesFind = {
      deleted: true
   };

   // ----- Pagination ----- //
   const limitItems = 10;
   const pagination = await paginationHelper.paging(request, deletedCategoriesFind, limitItems, ProductCategoryModel); // { currentPage: 1, limitItems: 10, startIndex: 0, totalPage:... }
   // ----- End pagination -----//
   

   const listOfDeletedCategories = await ProductCategoryModel
      .find(deletedCategoriesFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex);

   // Because the field "deletedBy" in database only stores the id of that person 
   for(const eachCategory of listOfDeletedCategories) 
   {
      // -- Person deleted soft -- //
      if(eachCategory.deletedBy) {
         const accountDeleted = await AccountModel.findOne(
            {
               _id: eachCategory.deletedBy
            }
         );
   
         eachCategory.deletedBy_FullName = accountDeleted.fullName;
      }
      else {
         eachCategory.deletedBy_FullName = "";
      }

      eachCategory.deletedAt_Format = moment(eachCategory.updatedAt).format("DD/MM/YYYY HH:mm:ss"); // format day, time
      // -- End person deleted soft -- //
   }

   response.render(
      "admin/pages/product-categories/trash.pug",
      {
         listOfDeletedCategories: listOfDeletedCategories,
         pagination: pagination
      }
   );
}

// [PATCH] /admin/product-categories/recover/:idCategory
module.exports.recoverCategory= async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("product-categories_delete"))
   {
      try {
         const categoryId = request.params.idCategory;
      
         await ProductCategoryModel.updateOne(
            {
               _id: categoryId
            },
            {
               deleted: false
            }
         );
      
         request.flash("success", "Recover successfully!"); // chi la dat ten key "success"
      
         response.json(
            {
               code: 200
            }
         );
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/product-categories/trash
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [PATCH] /admin/product-categories/recover-many
module.exports.recoverManyCategories = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "recoverManyItems") {
         await ProductCategoryModel.updateMany(
            {
               _id: listOfIds
            },
            {
               deleted: false
            }
         );

         request.flash("success", "Recover successfully!"); // chi la dat ten key "success"

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

// [DELETE] /admin/product-categories/delete-permanent/:idCategory
module.exports.permanentDeleteCategory = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_delete"))
   {
      try {
         const categoryId = request.params.idCategory;
      
         await ProductCategoryModel.deleteOne(
            {
               _id: categoryId
            }
         );
      
         response.json(
            {
               code: 200
            }
         );
      }
      catch(error) {
         response.redirect("back"); // back to page [GET] /admin/product-categories/trash
      }
   }
   else {
      response.send("403"); // 403 forbidden, no permission
   }
}

// [DELETE] /admin/product-categories/delete-many-permanent
module.exports.permanentDeleteManyCategories = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("product-categories_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "deletePermanentManyItems") {
         await ProductCategoryModel.deleteMany(
            {
               _id: listOfIds
            }
         );
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
// ---------------End []------------------ //