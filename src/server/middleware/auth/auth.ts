import type { Response, NextFunction } from "express";
import { authErrors } from "../../utils/errors";
import type { CustomRequest } from "./types";

const auth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const { noTokenError, missingBearerError } = authErrors;

  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      next(noTokenError);
      return;
    }

    if (!authHeader.startsWith("Bearer")) {
      next(missingBearerError);
    }
  } catch (error: unknown) {
    next(error);
  }
};

export default auth;
