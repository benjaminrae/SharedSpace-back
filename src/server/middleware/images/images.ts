import type { Response, NextFunction } from "express";
import type { CustomRequest } from "../auth/types";

export const backupImages = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (error: unknown) {
    next(error);
  }
};
