const jwt = require("jsonwebtoken");
const { onError } = require("../utils");
const { client } = require("../config/redis_config");

const verifyAccessToken = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return onError(res, 401, "Not Allowed");
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decod) => {
    if (error) {
      return onError(res, 401, "Token is incorrect or expired");
    } else {
      const response = await client.get(`accessToken-${decod.payload.id}`);
      if (response) {
        req.user = decod.payload;
        return next();
      } else {
        return onError(res, 400, "Already logged out!");
      }
    }
  });
};

module.exports = verifyAccessToken;
