const express = require("express");
const router = express.Router(); // ham Router() de dinh nghia ra cac route con

const controller = require("../../controllers/client/search.controller.js");

router.get("/", controller.getSearchPage);
router.get("/suggest", controller.getSuggestions);


module.exports = router;