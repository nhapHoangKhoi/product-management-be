module.exports.search = (request, itemFind) =>
{
   let keyword = "";
   let objectReturn = "";
   
   if(request.query.inputKeyword) 
   {
      const regex = new RegExp(request.query.inputKeyword, "i");
      itemFind.title = regex;

      keyword = request.query.inputKeyword;

      objectReturn = {
         itemFindTitle: itemFind.title,
         keyword: keyword
      };
   }

   return objectReturn;
}