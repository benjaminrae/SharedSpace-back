import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import type { CustomTokenPayload } from "../../controllers/userControllers/types";
import { authErrors } from "../../utils/errors.js";
import type { CustomRequest } from "./types";
import { environment } from "../../../loadEnvironment.js";

const { jwtSecret } = environment;

const auth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const { noTokenError, missingBearerError } = authErrors;

  const authHeader = req.header("Authorization");

  if (!authHeader) {
    next(noTokenError);
    return;
  }

  if (!authHeader.startsWith("Bearer")) {
    next(missingBearerError);
    return;
  }

  const token = authHeader.replace(/^Bearer\s*/, "");

  const user: CustomTokenPayload = jwt.verify(
    token,
    jwtSecret
  ) as CustomTokenPayload;

  req.userId = user.id;

  next();
};

export default auth;
