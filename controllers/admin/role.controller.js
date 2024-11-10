const RoleModel = require("../../models/role.model.js");

const systemConfigs = require("../../config/system.js");
const paginationHelper = require("../../helpers/pagination.helper.js");

// ----------------[]------------------- //
// [GET] /admin/roles/
module.exports.index = async (request, response) => 
{
   const roleFind = {
      deleted: false
   };

   const listOfRoles = await RoleModel.find(roleFind);

   response.render(
      "admin/pages/roles/index.pug", 
      {
         pageTitle: "Nhóm quyền",
         listOfRoles: listOfRoles
      }
   );
}

// [PATCH] /admin/roles/change-multi
module.exports.changeMulti = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("roles_edit") ||
      response.locals.correspondRole.permissions.includes("roles_delete")) 
   {
      // console.log(request.body);
      // {
      //    selectedValue: 'active',
      //    listOfIds: [ '66f972ce307bea1ebe5e8fe5', '66f972ce307bea1ebe5e8fe6' ]
      // }
   
      const { selectedValue, listOfIds } = request.body;
   
      switch(selectedValue)
      {
         case "deleteSoftManyItems":
            if(response.locals.correspondRole.permissions.includes("roles_delete")) {
               await RoleModel.updateMany(
                  {
                     _id: listOfIds
                  },
                  {
                     deleted: true
                  }
               );
               request.flash("success", "Xoá thành công!"); // chi la dat ten key "success"
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
      response.send("403"); // 403 nghia la ko co quyen
   }
}

// [PATCH] /admin/roles/delete/:idRole
module.exports.softDeleteRole = async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("roles_delete")) 
   {
      try {
         const roleId = request.params.idRole;
      
         await RoleModel.updateOne(
            {
               _id: roleId
            },
            {
               deleted: true
            }
         );
      
         request.flash("success", "Xoá thành công!"); // chi la dat ten key "success"
      
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
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/roles/create
module.exports.getCreatePage = (request, response) => 
{
   response.render(
      "admin/pages/roles/create.pug", 
      {
         pageTitle: "Tạo mới nhóm quyền",
      }
   );
}

// [POST] /admin/roles/create
module.exports.createRole = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("roles_create")) {
      const newRoleModel = new RoleModel(request.body);
      await newRoleModel.save();
   
      // response.send("OK Frontend");
      request.flash("success", "Thêm mới nhóm quyền thành công!");
      response.redirect(`/${systemConfigs.prefixAdmin}/roles`);
   }
   else {
      response.send("403"); // 403 nghia la ko co quyen
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/roles/edit/:idRole
module.exports.getEditPage = async (request, response) => 
{
   try {
      const roleId = request.params.idRole;

      const roleFind = {
         _id: roleId,
         deleted: false
      };

      const theRoleData = await RoleModel.findOne(roleFind);
      
      if(theRoleData) // check != null, vi co render ra giao dien nen them if else cho nay nua
      {
         response.render(
            "admin/pages/roles/edit.pug", 
            {
               pageTitle: "Chỉnh sửa nhóm quyền",
               theRoleData: theRoleData
            }
         );
      }
      else {
         response.redirect(`/${systemConfigs.prefixAdmin}/roles`);
      }
   }
   catch(error) {
      // catch la do nguoi ta hack, pha
      // console.log(error);
      request.flash("error", "ID không hợp lệ!");
      response.redirect(`/${systemConfigs.prefixAdmin}/roles`);
   }
}

// [PATCH] /admin/roles/edit/:idRole
module.exports.editRole = async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("roles_edit")) 
   {
      try {
         const roleId = request.params.idRole;
   
         await RoleModel.updateOne(
            {
               _id: roleId
            },
            request.body
         );
   
         request.flash("success", "Cập nhật thành công!");
         // response.send("OK Frontend");
         response.redirect("back"); // tuc la quay ve lai trang [GET] /admin/roles/edit
      }
      catch(error) {
         // catch la do nguoi ta hack, pha
         console.log(error);
         request.flash("error", "ID nhóm quyền không hợp lệ!");
         response.redirect(`/${systemConfigs.prefixAdmin}/roles`);
      }
   }
   else {
      response.send("403"); // 403 nghia la ko co quyen
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/roles/permissons
module.exports.getPermissionPage = async (request, response) => 
{
   const roleFind = {
      deleted: false
   };

   const records = await RoleModel.find(roleFind);

   response.render(
      "admin/pages/roles/permissions.pug", 
      {
         pageTitle: "Phân quyền",
         records: records
      }
   );
}

// [PATCH] /admin/roles/permissons
module.exports.editPermissions = async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("roles_permissions"))
   {
      const listRoles = request.body;
   
      for(const eachRole of listRoles) {
         await RoleModel.updateOne(
            {
               _id: eachRole.id,
               deleted: false
            },
            {
               permissions: eachRole.permissions
            }
         );
      }
   
      // request.flash("success", "Cập nhật thành công!"); // cach nay truoc gio, thu dung cach khac
   
      response.json(
         {
            code: 200,
            message: "Cập nhật thành công!"
         }
      );
   }
   else {
      response.send("403"); // 403 nghia la ko co quyen
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/roles/trash
module.exports.getDeletedRoles = async (request, response) =>
{
   const deletedRoleFind = {
      deleted: true
   };

   // ----- Pagination ----- //
   const limitItems = 10;
   const pagination = await paginationHelper.paging(request, deletedRoleFind, limitItems, RoleModel); // { currentPage: 1, limitItems: 10, startIndex: 0, totalPage:... }
   // ----- End pagination -----//
   

   const listOfDeletedRoles = await RoleModel
      .find(deletedRoleFind)
      .limit(pagination.itemsLimited)
      .skip(pagination.startIndex);

   response.render(
      "admin/pages/roles/trash.pug",
      {
         listOfDeletedRoles: listOfDeletedRoles,
         pagination: pagination
      }
   );
}

// [PATCH] /admin/roles/recover/:idRole
module.exports.recoverRole= async (request, response) => 
{
   if(response.locals.correspondRole.permissions.includes("roles_delete"))
   {
      try {
         const roleId = request.params.idRole;
      
         await RoleModel.updateOne(
            {
               _id: roleId
            },
            {
               deleted: false
            }
         );
      
         request.flash("success", "Khôi phục thành công!"); // chi la dat ten key "success"
      
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
      response.send("403"); // 403 nghia la ko co quyen
   }
}

// [PATCH] /admin/roles/recover-many
module.exports.recoverManyRoles = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("roles_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "recoverManyItems") {
         await RoleModel.updateMany(
            {
               _id: listOfIds
            },
            {
               deleted: false
            }
         );

         request.flash("success", "Khôi phục sản phẩm thành công!"); // chi la dat ten key "success"

         response.json(
            {
               code: 200
            }
         );
      }
   }
   else {
      response.send("403"); // 403 nghia la ko co quyen
   }
}

// [DELETE] /admin/roles/delete-permanent/:idRole
module.exports.permanentDeleteRole = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("roles_delete"))
   {
      try {
         const roleId = request.params.idRole;
      
         await RoleModel.deleteOne(
            {
               _id: roleId
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
      response.send("403"); // 403 nghia la ko co quyen
   }
}

// [DELETE] /admin/roles/delete-many-permanent
module.exports.permanentDeleteManyRoles = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("roles_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "deletePermanentManyItems") {
         await RoleModel.deleteMany(
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
      response.send("403"); // 403 nghia la ko co quyen
   }
}
// ----------------End []------------------- //