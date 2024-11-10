const express = require('express');
require("dotenv").config();
const bodyParser = require('body-parser');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

const database = require("./config/database.js");
database.connectDatabase();

const systemConfigs = require("./config/system.js");
const routeClient = require("./routes/client/index.route.js");
const routeAdmin = require("./routes/admin/index.route.js");

const app = express();  // khoi tao ung dung web su dung express
// const port = 3000;
const port = process.env.PORT;

// app.set("views", "./views"); // doi voi response.render(), mac dinh di vao folder views
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// app.use(express.static("public")); // nhung cac file tinh, tuc la folder public, mac dinh tu di vao folder public
app.use(express.static(`${__dirname}/public`));


// methodOverride
app.use(methodOverride('_method'));
// End methodOverride

// Flash
app.use(cookieParser('chuoigicungduoc'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// End flash

// bodyParser
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json, cai nay la FE gui data len thong qua chuoi JSON
// End bodyParser

// tinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End tinyMCE

// app global variables for pug only
// any pug files can use variable "prefixAdmin"
app.locals.prefixAdmin = systemConfigs.prefixAdmin;
// End app global variables for pug only


routeClient.index(app); // goi den ham index cua file index.route.js
routeAdmin.index(app);
app.get("*", (request, response) => {
   response.render(
      "client/pages/errors/404.pug",
      {
         pageTitle: "404 Not Found"
      }
   );
});


app.listen(port, () => {
   console.log(`App listening on port ${port}`);
});