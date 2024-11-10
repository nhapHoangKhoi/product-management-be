module.exports.createProduct = async (request, response, next) =>
{
   if(!request.body.title) 
   {
      request.flash("error", "Tiêu đề không được để trống!");
      response.redirect("back");
      return;
   }

   next(); // thoa dieu kien thi next sang buoc tiep theo
}