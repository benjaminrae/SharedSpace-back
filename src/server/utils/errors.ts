import CustomError from "../../CustomError/CustomError.js";
import httpStatusCodes from "./httpStatusCodes.js";

const {
  clientErrors: { unauthorizedCode, conflictsErrorCode },
} = httpStatusCodes;

const incorrectCredentialsMessage = "Incorrect username or password";

export const loginErrors = {
  userNotFoundError: new CustomError(
    "Username not found",
    unauthorizedCode,
    incorrectCredentialsMessage
  ),

  incorrectPasswordError: new CustomError(
    "Incorrect password",
    unauthorizedCode,
    incorrectCredentialsMessage
  ),
};

export const registerErrors = {
  alreadyRegisteredError: new CustomError(
    "User already exists",
    conflictsErrorCode,
    "That username is taken"
  ),
};

export const authErrors = {
  noTokenError: new CustomError(
    "No token provided",
    unauthorizedCode,
    "No token provided"
  ),

  missingBearerError: new CustomError(
    "Missing Bearer in token",
    401,
    "Bad token"
  ),
};
