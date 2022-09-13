const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  age: {
    type: Number,
  },
  birthDate: {
    type: String,
  },
  maritalStatus: {
    type: String,
    enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
  },
  nationality: {
    type: String,
  },
  profileUrl: {
    type: String,
  },

  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Documents",
  },
  role: {
    type: String,
  },
});

const userModal = mongoose.model("Users", userSchema);

module.exports = userModal;
