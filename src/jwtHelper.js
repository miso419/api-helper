const jwt = require("jsonwebtoken");
const { ApiError, apiErrorCodes } = require("./errorHandler");

const createToken = (payload, key, expiresIn) =>
  jwt.sign(payload, key, { expiresIn });

const verifyToken = (token, key, rejectIfTokenNotProvided = true) => {
  return new Promise((resolve, reject) => {
    if (token) {
      return jwt.verify(token, key, (err, decoded) => {
        if (err) {
          return reject(
            new ApiError({
              code: apiErrorCodes.ERROR_40101,
              details: "Token is invalid",
            })
          );
        }
        return resolve(decoded);
      });
    }
    if (rejectIfTokenNotProvided) {
      return reject(
        new ApiError({ code: apiErrorCodes.ERROR_40001, fieldName: "token" })
      );
    }
    return resolve(null);
  });
};

module.exports = {
  createToken,
  verifyToken,
};
