const express = require("express");
const chalk = require("chalk");
require("./db/mongoose");
const requestIp = require("request-ip");

const userRouters = require("./routers/user");

const userApp = express();
const port = process.env.PORT;

userApp.use(express.json());
userApp.use(requestIp.mw());
userApp.use(userRouters);

userApp.listen(port, () => {
  console.log(chalk.green.inverse("Server is running on port " + port));
});
