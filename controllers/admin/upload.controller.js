
// [POST] /admin/upload/
module.exports.uploadMCEImageToCloud = (request, response) => 
{
   // console.log(request.body);
   response.json({
      location: request.body.file
   });
}