import "../../loadEnvironment.js";
import debugConfig from "debug";
import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import type CustomError from "../../CustomError/CustomError.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";

const {
  serverErrors: { internalServerError },
} = httpStatusCodes;

const debug = debugConfig("shared-space:server:middleware:errors");

export const generalError = (
  error: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction
) => {
  const publicMessage =
    error.publicMessage || "There was a problem on the server";
  const statusCode = error.statusCode || internalServerError;

  debug(chalk.red.bold(`There was an error: ${error.message}`));

  res.status(statusCode).json({ error: publicMessage });
};
