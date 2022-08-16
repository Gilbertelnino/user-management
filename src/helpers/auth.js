const { config } = require("dotenv");
const { verify } = require("jsonwebtoken");
const { genSalt, hash } = require("bcryptjs");

config();

const encryptPassword = async (password) => {
  const salt = await genSalt(12);
  const hashed = await hash(password, salt);
  return hashed;
};

const verifyLink = (token, secret) => {
  try {
    const data = verify(token, secret);
    return data;
  } catch (error) {
    return "Internal Server Error";
  }
};

module.exports = { encryptPassword, verifyLink };
