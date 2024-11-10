const UserModel = require("../../models/user.model");

module.exports.checkInfoUser = async (request, response, next) =>
{
   if(request.cookies.tokenUser) {
      const theUser = await UserModel.findOne(
         {
            tokenUser: request.cookies.tokenUser,
            deleted: false
         }
      );

      if(theUser) {
         response.locals.theUser = theUser; // pug files that have this middleware can use this variable "theUser"
      }
   }

   next();
}