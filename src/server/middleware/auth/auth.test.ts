import type { NextFunction, Response } from "express";
import { authErrors } from "../../utils/errors";
import httpStatusCodes from "../../utils/httpStatusCodes";
import auth from "./auth";
import type { CustomRequest } from "./types";

const { noTokenError } = authErrors;

const {
  clientErrors: { unauthorizedCode },
} = httpStatusCodes;

const req: Partial<CustomRequest> = {};

const res: Partial<Response> = {};

const next: NextFunction = jest.fn();

describe("Given the auth middleware", () => {
  describe("When it receives a CustomRequest with no auth header", () => {
    test("Then it should invoke next with an error with status 401 and message 'No token provided'", () => {
      req.header = jest.fn().mockReturnValueOnce(undefined);

      auth(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(noTokenError);
      expect(noTokenError).toHaveProperty("statusCode", unauthorizedCode);
      expect(noTokenError).toHaveProperty("publicMessage", "No token provided");
    });
  });
});
