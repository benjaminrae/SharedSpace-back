import "../../loadEnvironment.js";
import debugConfig from "debug";
import { ValidationError } from "express-validation";
import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import CustomError from "../../CustomError/CustomError.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";

const {
  serverErrors: { internalServerErrorCode: internalServerError },
  clientErrors: { notFoundErrorCode: notFoundError },
} = httpStatusCodes;

const debug = debugConfig("shared-space:server:middleware:errors");

export const unknownEndpoint = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { path } = req;

  next(
    new CustomError(
      `Unknown Endpoint: ${path}`,
      notFoundError,
      "Unknown Endpoint"
    )
  );
};

export const generalError = (
  error: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction
) => {
  if (error instanceof ValidationError) {
    const validationErrors = error.details.body
      .map((joiError) => joiError.message)
      .join("\n");

    error.publicMessage = validationErrors;
  }

  const publicMessage =
    error.publicMessage || "There was a problem on the server";

  const statusCode = error.statusCode || internalServerError;

  debug(chalk.red.bold(`There was an error: ${error.message}`));

  res.status(statusCode).json({ error: publicMessage });
};
