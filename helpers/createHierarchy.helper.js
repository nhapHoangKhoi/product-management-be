const createTree = (array, parentId = "") => 
{
   const newArray = [];

   for(const anItem of array) 
   {
      if(anItem.parent_id == parentId) // check if that item has its own children
      {
         const children = createTree(array, anItem.id); // recursive
         
         if(children.length > 0) {
            anItem.children = children;
         }
         newArray.push(anItem);
      }
   }

   return newArray;
}

module.exports = (array, parentId = "") => {
   const tree = createTree(array, parentId);
   return tree;
}