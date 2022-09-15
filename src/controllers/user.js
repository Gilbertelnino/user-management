const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const {
  signAccessToken,
  generateToken,
  emailVerifytURL,
  confirmUserTemplate,
  forgotPasswordTemplate,
  passwordResetURL,
  encryptPassword,
  verifyLink,
  cloudinaryFileUpload,
  sendDocumentVerifiedEmail,
} = require("../helpers");

const { User, Documents } = require("../database/models");
const { onError, onSuccess } = require("../utils");
class UserController {
  // get users
  static async getUsers(req, res) {
    try {
      const users = await User.find({}).populate("documentId");
      return onSuccess(res, 200, "All users Fetched Successfully", users);
    } catch (error) {
      console.log(error);
      return onError(res, 500, "Internal server error");
    }
  }

  //   get user by id
  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id).populate("documentId");
      if (!user) {
        return onError(res, 404, "User not found");
      } else {
        return onSuccess(res, 200, "User Fetched Successfully", user);
      }
    } catch (error) {
      return onError(res, 500, "Internal server error");
    }
  }

  // get profile info
  static async getProfile(req, res) {
    try {
      const { id } = req.user;
      const user = await User.findOne({ _id: id }).populate("documentId");

      const doc = await Documents.findOne({ userId: id });
      const data = {
        user,
        doc,
      };
      return onSuccess(res, 200, "User Fetched Successfully", data);
    } catch (error) {
      return onError(res, 500, "Internal server error");
    }
  }

  // register user
  static async registerUser(req, res) {
    try {
      if (!req.files) return onError(res, 400, "Please Provide an image");
      const { photo } = req.files;
      const tempPath = photo.tempFilePath;
      const { secure_url } = await cloudinaryFileUpload(tempPath);
      const temp_secret = speakeasy.generateSecret();
      const data = {
        ...req.body,
        profileUrl: secure_url,
        temp_secret: temp_secret.base32,
      };
      const user = await User.findOne({ email: data.email });
      if (user) return onError(res, 400, "Emial already Registered");
      const token = generateToken(data);
      const url = emailVerifytURL(token);
      confirmUserTemplate(
        data,
        url,
        "Verify you email to continue! email is valid for 1 hour!"
      );
      return onSuccess(
        res,
        200,
        `Hello, ${req.body.firstName} Confirmation link sent!`
      );
    } catch (error) {
      return onError(res, 500, "internal server error");
    }
  }

  // create user after verification
  static async verifyUser(req, res) {
    try {
      // decode jwt = require(Url
      const userToken = req.query.token;

      const userInfo = jwt.decode(userToken, process.env.TOKEN_SECRET_KEY);

      // distructuring user info
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        age,
        maritalStatus,
        nationality,
        profileUrl,
        birthDate,
        temp_secret,
      } = userInfo.payload;
      // check user if is already an exist

      const emailExist = await User.findOne({ email });
      if (emailExist)
        return onError(
          res,
          400,
          `Hi, ${firstName} you have already registered with this email`
        );

      // Hash passwords

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // verify otp
      const verified = speakeasy.totp.verify({
        secret: temp_secret,
        encoding: "base32",
        token: req.body.otp,
      });

      if (!verified) return onError(res, 400, "Invalid code or expired");

      const newuser = await User.create({
        firstName,
        lastName,
        email,
        password,
        gender,
        age,
        maritalStatus,
        nationality,
        profileUrl,
        birthDate,
        password: hashedPassword,
        role: "Admin",
        secret,
      });
      const accessToken = await signAccessToken(newuser);
      return res.redirect(`${process.env.FRONTEND_URL}/verify/${accessToken}`);
    } catch (err) {
      return onError(res, 500, "Internal Server error");
    }
  }

  static async loginUser(req, res) {
    // check if password is correct
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return onError(res, 400, "Invalid Email or Password");
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return onError(res, 401, "Invalid Email or Password");
      const accessToken = await signAccessToken(user);

      return res.status(200).json({
        message: "You Logged in successfully",
        accessToken,
      });
    } catch (error) {
      console.log(error);
      return onError(res, 500, "Internal Server Error");
    }
  }

  static async logout(req, res) {
    try {
      const { id: userId } = req.user;
      await client.del(`refreshToken-${userId}`);
      await client.del(`accessToken-${userId}`);
      return onSuccess(res, 200, "You logged out successfully.");
    } catch (error) {
      return onError(res, 500, "Internal Server Error");
    }
  }

  // Forgot password and reset password

  static async forgetPassword(req, res) {
    try {
      const { email } = req.body;
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        const token = jwt.sign(
          { email: foundUser.email, id: foundUser._id },
          foundUser.password,
          {
            expiresIn: "24h",
          }
        );
        const resetUrl = passwordResetURL(foundUser, token);
        forgotPasswordTemplate(
          foundUser,
          resetUrl,
          "we have recieved change password request if it was you click the link below, otherwise ignore this email"
        );
        return onSuccess(res, 200, "check you email to change password");
      }
    } catch (error) {
      console.log(error);
      return onError(res, 500, "Internal Server Error");
    }
  }

  static async getResetPasswordLink(req, res) {
    try {
      const token = req.query.token;
      const email = req.query.email;
      const user = await User.findOne({ email });
      const verifyToken = jwt.verify(token, user.password);
      if (!verifyToken) {
        return onError(res, 401, "Unauthorized action");
      }
      return res.redirect(
        `${process.env.FRONTEND_URL}/reset-password/${token}/${email}`
      );
    } catch (error) {
      return onError(res, 500, "Internal Server Error");
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email } = req.params;
      const foundUser = await User.findOne({ email });
      const password = await encryptPassword(req.body.password);
      const { email: useremail } = verifyLink(
        req.params.token,
        foundUser.password
      );
      if (!useremail) return onError(res, 401, "Unauthorized Action");
      else {
        foundUser.password = password;
        foundUser.email = useremail;
        await foundUser.save();
        console.log("here");
        return onSuccess(
          res,
          200,
          "Password Changed Successfully now you can login!"
        );
      }
    } catch (error) {
      return onError(res, 500, "Internal Server Error");
    }
  }
  static async createDocument(req, res) {
    try {
      const { IDNumber } = req.body;
      const { id: userId } = req.user;
      const user = await User.findOne({ _id: userId });
      if (!user) return onError(res, 400, "User not found");
      if (!req.files) return onError(res, 400, "Please Provide an image");
      const { doc } = req.files;
      const tempPath = doc.tempFilePath;
      const { secure_url } = await cloudinaryFileUpload(tempPath);

      const document = await Documents.create({
        IDNumber,
        officialDocument: secure_url,
        userId,
        state: "PENDING VERIFICATION",
      });

      return onSuccess(res, 201, "Document Added successfully", document);
    } catch (error) {
      console.log(error);
      return onError(res, 500, "Internal server error");
    }
  }

  // get all documents
  static async getAllDocuments(req, res) {
    try {
      const { role } = req.user;
      // if (role !== "admin") return onError(res, 401, "Unauthorized Action");
      const documents = await Documents.find({}).populate(
        "userId",
        "firstName lastName email"
      );
      return onSuccess(res, 200, "Documents retrieved successfully", documents);
    } catch (error) {
      return onError(res, 500, "Internal server error");
    }
  }

  // verify document
  static async verifyDocument(req, res) {
    try {
      const { userId, documentId } = req.params;
      const { role } = req.user;
      // if (role !== "admin") return onError(res, 401, "Unauthorized Action");
      const user = await User.findOne({ _id: userId });
      if (!user) return onError(res, 400, "User not found");

      // document exist or not
      const document = await Documents.findOne({ _id: documentId, userId });

      if (!document) return onError(res, 400, "Document not found");

      document.state = "VERIFIED";
      await document.save();

      // send email to user;
      const link = `${process.env.FRONTEND_URL}`;
      const message = `You document has been verified successfully, click on the link below to view profile`;
      sendDocumentVerifiedEmail(user, link, message);

      return onSuccess(res, 200, "Document verified successfully", document);
    } catch (error) {
      return onError(res, 500, "Internal Server Error");
    }
  }
}

module.exports = UserController;
