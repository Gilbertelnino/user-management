const Joi = require("joi");

const validateSignupInput = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    gender: Joi.string().valid("male", "female"),
    age: Joi.number(),
    birthDate: Joi.date(),
    maritalStatus: Joi.string().valid(
      "SINGLE",
      "MARRIED",
      "DIVORCED",
      "WIDOWED"
    ),
    nationality: Joi.string(),
  });

  return schema.validate(user);
};
const validateLoginInput = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  return schema.validate(user);
};

module.exports = { validateSignupInput, validateLoginInput };
