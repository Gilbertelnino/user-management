const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
  IDNumber: {
    type: String,
  },
  officialDocument: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  state: {
    type: String,
    enum: ["UNVERIFIED", "PENDING VERIFICATION", "VERIFIED"],
  },
});

const documentModal = mongoose.model("Documents", documentSchema);

module.exports = documentModal;
