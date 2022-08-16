const mongoose = require("mongoose");
const { validateSignupInput, validateLoginInput } = require("../validator");
const { onError } = require("../utils");

class Validator {
  static signup(req, res, next) {
    const { error } = validateSignupInput(req.body);
    if (error) return onError(res, 400, error.details[0].message);
    next();
  }
  static login(req, res, next) {
    const { error } = validateLoginInput(req.body);
    if (error) return onError(res, 400, error.details[0].message);
    next();
  }
  static validateMongodbId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return onError(res, 400, "Invalid id");
    }
    next();
  }
}

module.exports = Validator;
