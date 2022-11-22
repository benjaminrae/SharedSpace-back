import { Router } from "express";
import { loginUser } from "../../controllers/userControllers/userControllers.js";
import paths from "../paths.js";

const {
  partialPaths: { loginPath },
} = paths;

// eslint-disable-next-line new-cap
const usersRouter = Router();

usersRouter.post(loginPath, loginUser);

export default usersRouter;
