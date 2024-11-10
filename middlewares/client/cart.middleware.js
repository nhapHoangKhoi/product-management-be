const CartModel = require("../../models/cart.model");

module.exports.checkCartId = async (request, response, next) =>
{
   if(!request.cookies.cartId) {
      const cart = new CartModel(); // create an emtpy cart, but has ID in the database
      await cart.save();

      const expiredDays = 365 * 24 * 60 * 60 * 1000; // 1 year

      // store "cartId" in the cookie of the user
      response.cookie(
         "cartId", 
         cart.id,
         { 
            expires: new Date(Date.now() + expiredDays) 
         }
      );
   }
   else {
      const theCart = await CartModel.findOne(
         {
            _id: request.cookies.cartId
         }
      );

      response.locals.totalProductsInCart = theCart.products.length || 0;
   }

   next();
}