const express = require("express");
const router = express.Router();
const { UserController } = require("../controllers");
const { Validator, verifyAccessToken } = require("../middlewares");

router.get("/all", verifyAccessToken, UserController.getUsers);
// profile
router.get("/profile", verifyAccessToken, UserController.getProfile);
router.get(
  "/:id",
  Validator.validateMongodbId,
  verifyAccessToken,
  UserController.getUserById
);

router.post("/register", Validator.signup, UserController.registerUser);
router.post("/login", Validator.login, UserController.loginUser);
router.delete("/logout", verifyAccessToken, UserController.logout);
router.get("/verify/signup", UserController.verifyUser);

router.post("/forgot-password", UserController.forgetPassword);
router.get("/reset-password/url", UserController.getResetPasswordLink);
router.patch("/reset-password/:token/:email", UserController.resetPassword);
router.post("/document/add", verifyAccessToken, UserController.createDocument);
router.get("/document/all", verifyAccessToken, UserController.getAllDocuments);
router.patch(
  "/:userId/document/:documentId/verify",
  verifyAccessToken,
  UserController.verifyDocument
);

module.exports = router;
