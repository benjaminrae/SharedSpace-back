import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { validationErrors } from "../../utils/errors";
import type { CustomRequest } from "../auth/types";

const { invalidIdError } = validationErrors;

const validateId = (req: CustomRequest, res: Response, next: NextFunction) => {
  const { locationId } = req.params;

  if (!mongoose.isValidObjectId(locationId)) {
    next(invalidIdError);
    return;
  }

  next();
};

export default validateId;
