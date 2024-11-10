const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
   {
      customerInfo: {
         fullName: String,
         phone: String,
         address: String
      },
      products: [
         {
            productId: String,
            priceOld: Number,
            discountPercentage: Number,
            quantity: Number
         }
      ]
   },
   {
      timestamps: true // automatically insert field createdAt, updatedAt
   }
);

const OrderModel = mongoose.model("Order", orderSchema, "orders");

module.exports = OrderModel;