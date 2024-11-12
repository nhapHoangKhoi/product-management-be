const systemConfigs = require("../../config/system.js");
const dashboardRoute = require("./dashboard.route.js");
const productAdminRoute = require("./product.route.js");
const productCategoryAdminRoute = require("./product-category.route.js");
const roleRoute = require("./role.route.js");
const accountRoute = require("./account.route.js");
const authenRoute = require("./authen.route.js");
const profileRoute = require("./profile.route.js");
const settingRoute = require("./setting.route.js");
const uploadRoute = require("./upload.route.js");

const authenMiddleware = require("../../middlewares/admin/authen.middleware.js");

// create routes
module.exports.index = (app) =>
{
   const path = `/${systemConfigs.prefixAdmin}`;

   app.use(
      `${path}/dashboard`,
      authenMiddleware.checkAuthen, 
      dashboardRoute
   );

   app.use(
      `${path}/products`, 
      authenMiddleware.checkAuthen,
      productAdminRoute
   );

   app.use(
      `${path}/product-categories`, 
      authenMiddleware.checkAuthen,
      productCategoryAdminRoute
   );

   app.use(
      `${path}/roles`,
      authenMiddleware.checkAuthen, 
      roleRoute
   );
   
   app.use(
      `${path}/accounts`, 
      authenMiddleware.checkAuthen,
      accountRoute
   );

   app.use(
      `${path}/profile`, 
      authenMiddleware.checkAuthen,
      profileRoute
   );

   app.use(
      `${path}/settings`, 
      authenMiddleware.checkAuthen,
      settingRoute
   );
   
   app.use(`${path}/upload`, uploadRoute);
   
   app.use(`${path}/authen`, authenRoute);
}