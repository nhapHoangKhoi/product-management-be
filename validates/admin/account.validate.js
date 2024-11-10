module.exports.createAccountAdmin = async (request, response, next) =>
{
   if(!request.body.fullName) 
   {
      request.flash("error", "Họ tên không được để trống!");
      response.redirect("back");
      return;
   }

   if(!request.body.email) 
   {
      request.flash("error", "Email không được để trống!");
      response.redirect("back");
      return;
   }

   if(!request.body.password) 
   {
      request.flash("error", "Mật khẩu không được để trống!");
      response.redirect("back");
      return;
   }

   next(); // thoa dieu kien thi next sang buoc tiep theo
}

module.exports.editAccountAdmin = async (request, response, next) =>
{
   if(!request.body.fullName) 
   {
      request.flash("error", "Họ tên không được để trống!");
      response.redirect("back");
      return;
   }

   if(!request.body.email) 
   {
      request.flash("error", "Email không được để trống!");
      response.redirect("back");
      return;
   }

   next(); // thoa dieu kien thi next sang buoc tiep theo
}