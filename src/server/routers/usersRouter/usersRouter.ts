import { Router } from "express";
import { validate } from "express-validation";
import {
  loginUser,
  registerUser,
} from "../../controllers/userControllers/userControllers.js";
import loginUserSchema from "../../schemas/loginUserSchema.js";
import registerUserSchema from "../../schemas/registerUserSchema.js";
import paths from "../paths.js";

const {
  partialPaths: { loginPath, registerPath },
} = paths;

// eslint-disable-next-line new-cap
const usersRouter = Router();

usersRouter.post(
  loginPath,
  validate(loginUserSchema, {}, { abortEarly: false }),
  loginUser
);

usersRouter.post(
  registerPath,
  validate(registerUserSchema, {}, { abortEarly: false }),
  registerUser
);

export default usersRouter;
