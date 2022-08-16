const jwt = require("jsonwebtoken");
const { client } = require("../config/redis_config");

const signAccessToken = async (userInfo) => {
  try {
    const payload = {
      id: userInfo._id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      role: userInfo.role,
    };
    const token = jwt.sign({ payload }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    await client.set(`accessToken-${payload.id.toString()}`, token.toString());
    return token;
  } catch (error) {
    return error;
  }
};
const generateToken = (userinfo) => {
  try {
    const token = jwt.sign(
      { payload: userinfo },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    return token;
  } catch (error) {
    return "Internal server error";
  }
};

module.exports = { signAccessToken, generateToken };
