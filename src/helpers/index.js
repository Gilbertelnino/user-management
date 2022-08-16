const { encryptPassword, verifyLink } = require("./auth");
const {
  confirmUserTemplate,
  emailVerifytURL,
  passwordResetURL,
  forgotPasswordTemplate,
  sendDocumentVerifiedEmail,
} = require("./email");

const { signAccessToken, generateToken } = require("./jwt_helper");
const cloudinaryFileUpload = require("./cloudinary_upload");

module.exports = {
  encryptPassword,
  verifyLink,
  signAccessToken,
  confirmUserTemplate,
  emailVerifytURL,
  passwordResetURL,
  forgotPasswordTemplate,
  generateToken,
  cloudinaryFileUpload,
  sendDocumentVerifiedEmail,
};
