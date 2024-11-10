const SettingModel = require("../../models/setting.model.js");

module.exports.settingClient = async (request, response, next) =>
{
   const settingGeneral = await SettingModel.findOne({});

   response.locals.settingGeneral = settingGeneral; // pug files that have this middleware can use this variable "settingGeneral"

   next();
}