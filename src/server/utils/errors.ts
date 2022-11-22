import CustomError from "../../CustomError/CustomError.js";
import httpStatusCodes from "./httpStatusCodes.js";

const {
  clientErrors: { unauthorizedCode },
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
