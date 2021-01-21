const express = require("express");
const chalk = require("chalk");
const hbs = require("hbs");
const path = require("path");
require("./db/mongoose");
const requestIp = require("request-ip");

const publicDirPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

const userRouters = require("./routers/user");

const userApp = express();
const port = process.env.PORT;

userApp.set("view engine", "hbs");
userApp.set("views", viewsPath);
hbs.registerPartials(partialsPath);

userApp.use(express.static(publicDirPath));

// userApp.get("/superuser", (req, res) => {
//   res.render("index", {
//     title: "Administration page",
//     name: "Muteshi",
//   });
// });

// userApp.get("*", (req, res) => {
//   res.render("404-page", {
//     title: "404 not found",
//     error: "Page not found!",
//     name: "Muteshi",
//   });
// });

userApp.use(express.json());
userApp.use(requestIp.mw());
userApp.use(userRouters);

userApp.listen(port, () => {
  console.log(chalk.green.inverse("Server is running on port " + port));
});
