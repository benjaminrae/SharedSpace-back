import type { Request, Response, NextFunction } from "express";
import type { UserStructure } from "../../../database/models/types";
import User from "../../../database/models/User.js";
import { loginErrors } from "../../utils/errors.js";

export const loginUser = async (
  req: Request<Record<string, unknown>, Record<string, unknown>, UserStructure>,
  res: Response,
  next: NextFunction
) => {
  const { userNotFoundError } = loginErrors;
  const { username } = req.body;

  try {
    const user = await User.find({ username });

    if (!user) {
      next(userNotFoundError);
    }
  } catch {}
};
