const { tokenModal } = require("../database/models");
const jwt = require("jsonwebtoken");
const { onError } = require("./response");

const consumeToken = async (token) => {
  try {
    const tokens = await tokenModal.findOne({ token });
    if (!tokens) return "Uauthorized";
    return tokens;
  } catch (error) {
    return "Internal server error";
  }
};

const createToken = (userinfo) => {
  try {
    const payload = {
      firstName: userinfo.firstName,
      lastName: userinfo.lastName,
      email: userinfo.email,
      password: userinfo.password,
    };
    const token = jwt.sign({ payload: payload }, process.env.TOKEN_SECRET_KEY, {
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    return "something went wrong";
  }
};

const logout = (req, res, done) =>{
    try {
        const token = req.cookies["remember_me"];
    if (!token) {
    return done();
    }

    await tokenModal.remove({token})
    res.clearCookie("remember_me");
    return done
    } catch (error) {
        return onError(res, 500, 'something went wrong')
    }
}

module.exports = {consumeToken, createToken, logout}