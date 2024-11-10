const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
   {
      // _id: ... // id of the cart, automatically generated in database
      products: [
         {
            productId: String,
            quantity: Number
         }
      ]
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const CartModel = mongoose.model("Cart", cartSchema, "carts");

module.exports = CartModel;