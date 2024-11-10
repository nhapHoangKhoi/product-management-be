const AccountModel = require("../../models/account.model.js");
const RoleModel = require("../../models/role.model");

const systemConfigs = require("../../config/system.js");

module.exports.checkAuthen = async (request, response, next) =>
{
   if(!request.cookies.token) {
      response.redirect(`/${systemConfigs.prefixAdmin}/authen/login`);
      return;
   }

   const accountAdmin = await AccountModel.findOne(
      {
         token: request.cookies.token,
         deleted: false
      }
   ).select("fullName email phone avatar role_id status");

   if(!accountAdmin) {
      response.redirect(`/${systemConfigs.prefixAdmin}/authen/login`);
      return;
   }

   const correspondRole = await RoleModel.findOne(
      {
         _id: accountAdmin.role_id
      }
   ).select("title permissions");


   response.locals.accountAdmin = accountAdmin; // pug files after this middleware can use this variable "accountAdmin"
   response.locals.correspondRole = correspondRole;

   next();
}