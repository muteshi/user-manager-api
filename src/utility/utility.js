const User = require("../models/user");
const validator = require("validator");
const chalk = require("chalk");

const addSuperUser = async function (userData) {
  if (userData.password1 !== userData.password2) {
    console.log(chalk.red.bold("Password do not match!"));
    return;
  }
  if (userData.password1.length < 6) {
    console.log(chalk.red.bold("Password should be more than 6 characters!"));
    return;
  }
  if (!validator.isEmail(userData.email)) {
    console.log(chalk.red.bold("Enter a valid email"));
    return;
  }

  if (userData.name.length <= 5) {
    console.log(chalk.red.bold("Enter a valid name"));
    return;
  }

  const user = await User.findOne({ email: userData.email });

  if (user) {
    console.log(chalk.bold.red(`${userData.email} already exists!`));
    return;
  }

  const newUser = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password1,
    superuser: true,
  });
  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
  }

  console.log(chalk.bold.green("Account created successfully"));
};

module.exports = {
  addSuperUser,
};
