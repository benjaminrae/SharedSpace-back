import "../../loadEnvironment.js";
import debugConfig from "debug";
import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import CustomError from "../../CustomError/CustomError.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";

const {
  serverErrors: { internalServerError },
  clientErrors: { notFoundError },
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
      "Unknown endpoint"
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
  const publicMessage =
    error.publicMessage || "There was a problem on the server";

  const statusCode = error.statusCode || internalServerError;

  debug(chalk.red.bold(`There was an error: ${error.message}`));

  res.status(statusCode).json({ error: publicMessage });
};
