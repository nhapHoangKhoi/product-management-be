const SettingModel = require("../../models/setting.model.js");

// ----------------[]------------------- //
// [GET] /admin/settings/general
module.exports.getGeneralSettingPage = async (request, response) => 
{
   const settingsGeneral = await SettingModel.findOne({});

   response.render(
      "admin/pages/settings/general.pug", 
      {
         pageTitle: "Cài đặt chung",
         settingsGeneral: settingsGeneral
      }
   );
}

// [PATCH] /admin/settings/general
module.exports.settingGeneral = async (request, response) => 
{
   const existedSettingModel = await SettingModel.findOne({});

   if(existedSettingModel) 
   {
      if(!request.body.logo) {
         request.body.logo = [];
      }

      await SettingModel.updateOne(
         {
            _id: existedSettingModel.id
         },
         request.body
      );
   }
   else {
      const newSettingModel = new SettingModel(request.body);
      await newSettingModel.save();
   }

   request.flash("success", "Cập nhật thành công!");
   response.redirect("back"); // go back to page [GET] /admin/settings/general
}
// ----------------End []------------------- //