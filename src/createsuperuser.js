const user = require("./utility/utility");
const yargsInteractive = require("yargs-interactive");

const options = {
  name: {
    type: "input",
    describe: "Enter your full name",
  },
  email: {
    type: "input",
    describe: "Enter your email",
  },
  password1: {
    type: "input",
    describe: "Password",
  },
  password2: {
    type: "input",
    describe: "Confirm your password",
  },
};

yargsInteractive()
  .usage("$0 <command> [args]")
  .interactive(options)
  .then((result) => {
    console.log(result);
    user.addSuperUser(result);
  });
