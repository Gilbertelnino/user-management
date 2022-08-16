const sgMail = require("@sendgrid/mail");
const mailgen = require("mailgen");
const dotenv = require("dotenv");

dotenv.config();

const template = new mailgen({
  theme: "default",
  product: {
    name: "Gilbert Elnino",
    link: "https://www.gilbertelnino.com/",
  },
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const host = process.env.BACKEND_URL;
const passwordResetURL = (user, token) =>
  `${host}/api/user/reset-password/url?token=${token}&email=${user.email}`;
const emailVerifytURL = (token) =>
  `${host}/api/user/verify/signup?token=${token}`;
const generateEmail = (name, instructions, link) => ({
  body: {
    name,
    intro: "We're very excited to have you on board.",
    action: {
      instructions,
      button: {
        color: "#22BC66", // Optional action button color
        text: "Confirm your account",
        link,
      },
    },
    outro: "Ndatimana Gilbert, Founder & CEO of gilbertelnino.com",
  },
});
const generateforgotPasswordEmail = (name, instructions, link) => ({
  body: {
    name,
    action: {
      instructions,
      button: {
        color: "#FF0000", // Optional action button color
        text: "Change Password",
        link,
      },
    },
  },
});

// generate document verified email
const generateDocumentVerifiedEmail = (name, instructions, link) => ({
  body: {
    name,
    action: {
      instructions,
      button: {
        color: "#22BC66", // Optional action button color
        text: "View Profile",
        link,
      },
    },
    outro: "Ndatimana Gilbert, Founder & CEO of gilbertelnino.com",
  },
});

// send document verified email
const sendDocumentVerifiedEmail = async (user, url, message) => {
  const emailBody = generateDocumentVerifiedEmail(user.firstName, message, url);
  const emailTemplate = template.generate(emailBody);
  const msg = {
    to: user.email,
    from: "gilbeltelnino@gmail.com",
    subject: "Document Verified",
    html: emailTemplate,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    return "Internal server error";
  }
};

const confirmUserTemplate = async (user, url, message) => {
  const emailBody = generateEmail(`${user.firstName}!`, message, `${url}`);
  const emailTemplate = template.generate(emailBody);

  const msg = {
    to: user.email,
    from: "gilbeltelnino@gmail.com",
    subject: "Verify Your Email",
    html: emailTemplate,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
    return "Internal server error";
  }
};
const forgotPasswordTemplate = async (user, url, message) => {
  const emailBody = generateforgotPasswordEmail(
    `${user.firstName}! You have requested to change your password`,
    message,
    `${url}`
  );
  const emailTemplate = template.generate(emailBody);

  const msg = {
    to: user.email,
    from: "gilbeltelnino@gmail.com",
    subject: "Change Password Request",
    html: emailTemplate,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    return "Internal server error";
  }
};

module.exports = {
  confirmUserTemplate,
  emailVerifytURL,
  passwordResetURL,
  forgotPasswordTemplate,
  sendDocumentVerifiedEmail,
};
