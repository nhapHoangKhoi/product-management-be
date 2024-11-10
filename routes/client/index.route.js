// route cha, route cap cao nhat

// viet ham, cu phap ES6
// export const index = () => {...}
//
// viet ham, cu phap common JS
// de viet JS o trong NodeJS

const homeRoute = require("./home.route.js");
const productRoute = require("./product.route.js");
const searchRoute = require("./search.route.js");
const cartRoute = require("./cart.route.js");
const checkoutRoute = require("./checkout.route.js");
const userRoute = require("./user.route.js");

const categoryProductMiddleware = require("../../middlewares/client/category-product.middleware.js");
const cartMiddleware = require("../../middlewares/client/cart.middleware.js");
const userMiddleware = require("../../middlewares/client/user.middleware.js");
const settingMiddleware = require("../../middlewares/client/setting.middleware.js");

// tao route
module.exports.index = (app) =>
{
   app.use(categoryProductMiddleware.categoryProduct); // viet o tren nay de ap dung cho tat ca cac trang
   app.use(cartMiddleware.checkCartId);
   app.use(userMiddleware.checkInfoUser);
   app.use(settingMiddleware.settingClient);

   app.use("/", homeRoute);
   app.use("/products", productRoute);
   app.use("/search", searchRoute);
   app.use("/cart", cartRoute);
   app.use("/checkout", checkoutRoute);
   app.use("/user", userRoute);
}