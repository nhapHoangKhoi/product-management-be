const CartModel = require("../../models/cart.model");
const ProductModel = require("../../models/product.model");
const OrderModel = require("../../models/order.model");

// ----------------[]------------------- //
// [GET] /checkout/
module.exports.index = async (request, response) =>
{
   try {
      const cartId = request.cookies.cartId;
      
      const theCart = await CartModel.findOne(
         {
            _id: cartId // find ID in databse, needs try catch
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
         "client/pages/checkout/index.pug",
         {
            pageTitle: "Checkout",
            cartDetail: theCart
         }
      );
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect("/products");
   }
}

// [POST] /checkout/order
module.exports.order = async (request, response) =>
{
   const cartId = request.cookies.cartId;
   const customerInfo = request.body;

   const orderData = {
      customerInfo: customerInfo,
      products: []
   };

   const cart = await CartModel.findOne(
      {
         _id: cartId
      }
   );

   for(const eachProduct of cart.products) 
   {
      const productInfoFull  = await ProductModel.findOne(
         {
            _id: eachProduct.productId
         }
      );
      
      orderData.products.push(
         {
            productId: eachProduct.productId,
            priceOld: productInfoFull.price,
            discountPercentage: productInfoFull.discountPercentage,
            quantity: eachProduct.quantity
         }
      );
   }

   const order = new OrderModel(orderData);
   await order.save();

   // after ordering successfully, reset products in cart to be empty
   await CartModel.updateOne(
      {
         _id: cartId
      },
      {
         products: []
      }
   );

   // decrease "stock" in Product Model
   for(const eachProduct of order.products) 
   {
      const stockOld = await ProductModel.findOne(
         {
            _id: eachProduct.productId
         }
      ).select("stock");

      const stockNew = stockOld.stock - eachProduct.quantity;

      await ProductModel.updateOne(
         {
            _id: eachProduct.productId
         },
         {
            stock: stockNew
         }
      );
   }

   response.redirect(`/checkout/success/${order.id}`);
}

// [GET] /checkout/success/:orderId
module.exports.getSuccessPage = async (request, response) =>
{
   try {
      const orderId = request.params.orderId;
      
      const order = await OrderModel.findOne(
         {
            _id: orderId
         }
      );

      let orderTotalPrice = 0;

      for(const eachProduct of order.products) 
      {
         const productInfoFull = await ProductModel.findOne(
            {
               _id: eachProduct.productId
            }
         );

         // insert new keys to each product
         eachProduct.thumbnail = productInfoFull.images[0];
         eachProduct.title = productInfoFull.title;
         eachProduct.priceNew = (productInfoFull.price - (productInfoFull.price * productInfoFull.discountPercentage/100)).toFixed(0);
         eachProduct.totalPrice = eachProduct.priceNew * eachProduct.quantity;
         
         // calculate total price for the whole order
         orderTotalPrice = orderTotalPrice + eachProduct.totalPrice;
      }

      response.render(
         "client/pages/checkout/success.pug",
         {
            pageTitle: "Order successfully",
            order: order,
            orderTotalPrice: orderTotalPrice
         }
      );
   }
   catch(error) {
      request.flash("error", "ID not valid!");
      response.redirect("/products");
   }
}
// ----------------End []------------------- //