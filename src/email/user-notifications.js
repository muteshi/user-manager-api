const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fromEmail = process.env.FROM_EMAIL;

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: fromEmail,
    subject: "Thanks for joining",
    text: `Welcome to the app ${name}`,
  });
};

const sendAccountDeleteEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: fromEmail,
    subject: "You account is deleted!",
    text: `${name}, you have successfully deleted your account`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendAccountDeleteEmail,
};
