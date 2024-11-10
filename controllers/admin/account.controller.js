const RoleModel = require("../../models/role.model.js");
const AccountModel = require("../../models/account.model.js");

const md5 = require('md5');
const generateHelper = require("../../helpers/generate.helper.js");
const systemConfigs = require("../../config/system.js");

// ----------------[]------------------- //
// [GET] /admin/accounts/
module.exports.index = async (request, response) => 
{
   try {
      const accountFind = {
         deleted: false
      };
   
      const listOfAccounts = await AccountModel.find(accountFind);
   
      for(const eachAccount of listOfAccounts) {
         const roleFind = {
            _id: eachAccount.role_id,
            deleted: false
         };
         const correspondRole = await RoleModel.findOne(roleFind);
         eachAccount.roleTitle = correspondRole.title;
      }
   
      response.render(
         "admin/pages/accounts/index.pug", 
         {
            pageTitle: "Tài khoản admin",
            listOfAccounts: listOfAccounts
         }
      );
   }
   catch(error) {
      request.flash("error", "ID không hợp lệ!");
   }
}

// [PATCH] /admin/accounts/change-status/:statusChange/:idAccountAmdin
module.exports.changeStatus = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("accounts_edit"))
   {
      try {
         const { idAccountAmdin, statusChange } = request.params; // { statusChange: '...', idAccountAmdin: '...' }
         
         // cap nhat data trong database
         // day la cua mongoose, ko lien quan gi toi phuong thuc GET, PATCH,...
         await AccountModel.updateOne(
            {
               _id: idAccountAmdin
            }, 
            {
               status: (statusChange == "active") ? "inactive" : "active",
               updatedBy: response.locals.accountAdmin.id
            }
         );
      
         request.flash("success", "Cập nhật trạng thái thành công!"); // chi la dat ten key "success"
   
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
// [GET] /admin/accounts/create
module.exports.getCreatePage = async (request, response) => 
{
   const roleFind = {
      deleted: false
   };

   const listOfRoles = await RoleModel
      .find(roleFind)
      .select(["title"]); // tra ra id (luon luon), truong title

   response.render(
      "admin/pages/accounts/create.pug", 
      {
         pageTitle: "Tạo tài khoản admin",
         listOfRoles: listOfRoles
      }
   );
}

// [POST] /admin/accounts/create
module.exports.createAccountAdmin = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("accounts_create"))
   {
      // ----- Encrypt password ----- //
      request.body.password = md5(request.body.password);
      // ----- End encrypt password ----- //
   
      // ----- Generate random token ----- //
      request.body.token = generateHelper.generateToken(30); 
      // ----- End generate random token ----- // 
   
      
      const newAccountModel = new AccountModel(request.body);
      await newAccountModel.save();
   
      request.flash("success", "Tạo tài khoản mới thành công!");
      response.redirect(`/${systemConfigs.prefixAdmin}/accounts`);
      // response.send("OK Frontend");
   }
   else {
      response.send("403");
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /admin/accounts/edit/:idAccount
module.exports.getEditPage = async (request, response) => 
{
   try {
      const accountId = request.params.idAccount;
      const roleFind = {
         deleted: false
      };
      const accountFind = {
         _id: accountId,
         deleted: false
      };
   
      const listOfRoles = await RoleModel
         .find(roleFind)
         .select(["title"]); // tra ra id (luon luon), truong title
      
      const theAccountData = await AccountModel.findOne(accountFind);
   
      if(theAccountData) // check != null, vi co render ra giao dien nen them if else cho nay nua
      {
         response.render(
            "admin/pages/accounts/edit.pug",
            {
               pageTitle: "Chỉnh sửa tài khoản admin",
               listOfRoles: listOfRoles,
               theAccountData: theAccountData
            }
         );
      }
      else {
         response.redirect(`/${systemConfigs.prefixAdmin}/accounts`);
      }
   }
   catch(error) {
      // catch la do nguoi ta hack, pha
      // console.log(error);
      request.flash("error", "ID tài khoản không hợp lệ!");
      response.redirect(`/${systemConfigs.prefixAdmin}/roles`);
   }
}

// [PATCH] /admin/accounts/edit/:idAccount
module.exports.editAccountAdmin = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("accounts_edit"))
   {
      try {
         const accountId = request.params.idAccount;
         
         if(!request.body.avatar) {
            request.body.avatar = [];
         }

         await AccountModel.updateOne(
            {
               _id: accountId,
               deleted: false
            },
            request.body
         );
      
         request.flash("success", "Cập nhật thành công!");
      }
      catch(error) {
         request.flash("error", "ID tài khoản không hợp lệ!");
      }
   
      // console.log(request.body);
      // response.send("OK Frontend");
      response.redirect("back"); // tuc la quay ve lai trang [GET] /admin/products/edit
   }
   else {
      response.send("403");
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [DELETE] /admin/accounts/delete-permanent/:idAdmin
module.exports.permanentDeleteAdmin = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("accounts_delete"))
   {
      try {
         const adminId = request.params.idAdmin;
      
         await AccountModel.deleteOne(
            {
               _id: adminId
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

// [DELETE] /admin/accounts/delete-many-permanent
module.exports.permanentDeleteManyAdmins = async (request, response) =>
{
   if(response.locals.correspondRole.permissions.includes("accounts_delete"))
   {
      const { selectedValue, listOfIds } = request.body;
   
      if(selectedValue == "deletePermanentManyItems") {
         await AccountModel.deleteMany(
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
      response.send("403"); // 403 nghia la ko co quyen
   }
}
// ----------------End []------------------- //