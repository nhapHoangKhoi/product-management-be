const CartModel = require("../../models/cart.model");
const ProductModel = require("../../models/product.model");

// ----------------[]------------------- //
// [POST] /cart/add/:productId
// that ra thi o day minh da tao cart o middleware truoc do roi
// nen ban chat o day phuong thuc PATCH cho de hieu
module.exports.addToCart = async (request, response) => 
{
   try {
      const cartId = request.cookies.cartId;
      const productId = request.params.productId;
      const quantity = parseInt(request.body.quantity);

      const theCart = await CartModel.findOne(
         {
            _id: cartId
         }
      );

      const existedProductInCart = theCart.products.find(
         item => item.productId == productId
      );

      if(existedProductInCart) {
         const totalQuantity = existedProductInCart.quantity + quantity;
         
         await CartModel.updateOne(
            {
               _id: cartId,
               "products.productId": productId
            },
            {
               $set: {
                  'products.$.quantity': totalQuantity
               }
            }
         );
      }
      else {
         await CartModel.updateOne(
            {
               _id: cartId,
            },
            {
               $push: {
                  products: {
                     productId: productId,
                     quantity: quantity
                  }
               }
            }
         );
      }
   
      // response.send("OK Frontend");
      request.flash("success", "Add to cart successfully!");
      response.redirect("back"); // go back to page [GET] /products/detail/:slug
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect(`/products`);
   }
}
// ----------------End []------------------- //


// ----------------[]------------------- //
// [GET] /cart/
module.exports.getCartPage = async (request, response) =>
{
   try {
      const cartId = request.cookies.cartId;
   
      const theCart = await CartModel.findOne(
         {
            _id: cartId // co tim den ID trong database, quang vo try catch
         }
      );

      theCart.totalPrice = 0; // add new key "totalPrice"

      if(theCart.products.length > 0) 
      {
         for(const product of theCart.products) {
            const productInfo = await ProductModel.findOne(
               {
                  _id: product.productId
               }
            ).select("title thumbnail images slug price discountPercentage stock");


            // ----- Calculate and add new key "priceNew" ----- //
            productInfo.priceNew = (productInfo.price - (productInfo.price * productInfo.discountPercentage/100)).toFixed(0);
            // ----- End calculate and add new key "priceNew" ----- //


            // add new key "productInfo" into each product
            product.productInfo = productInfo;

            // add new key "totalPrice" into each product
            product.totalPrice = productInfo.priceNew * product.quantity;

            theCart.totalPrice = theCart.totalPrice + product.totalPrice;
         }
      }
   
      response.render(
         "client/pages/cart/index.pug", 
         {
            pageTitle: "Cart",
            cartDetail: theCart
         }
      );
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect("/products");
   }
}

// [GET] /cart/delete/:productId
module.exports.deleteOutOfCart = async (request, response) => 
{
   try {
      const cartId = request.cookies.cartId;
      const productId = request.params.productId;
   
      await CartModel.updateOne(
         {
            _id: cartId,
         },
         {
            $pull: {
               products: {
                  productId: productId
               }
            }
         }
      );
   
      response.redirect("back"); // go back to page [GET] /cart
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect("/products");
   }
}

// [GET] /cart/update/:productId/:quantity (dung cai duoi day)
module.exports.updateQuantity_GET = async (request, response) => 
{
   try {
      const cartId = request.cookies.cartId;
      const productId = request.params.productId;
      const quantity = parseInt(request.params.quantity);

      await CartModel.updateOne(
         {
            _id: cartId,
            "products.productId": productId
         },
         {
            $set: {
               "products.$.quantity": quantity
            }
         }
      );
   
      response.redirect("back"); // go back to page [GET] /cart
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect("/products");
   }
}

// [PATCH] /cart/update/:productId/:quantity
module.exports.updateQuantity = async (request, response) => 
{
   try {
      const cartId = request.cookies.cartId;
      const productId = request.params.productId;
      const quantity = parseInt(request.params.quantity);

      await CartModel.updateOne(
         {
            _id: cartId,
            "products.productId": productId
         },
         {
            $set: {
               "products.$.quantity": quantity
            }
         }
      );
   
      response.json({
         code: 200
      });
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect("/products");
   }
}
// ----------------End []------------------- /