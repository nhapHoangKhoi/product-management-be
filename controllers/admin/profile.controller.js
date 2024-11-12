// [GET] /admin/profile/
module.exports.index = (request, response) => 
{
   response.render(
      "admin/pages/profile/index.pug", 
      {
         pageTitle: "Profile"
      }
   );
}