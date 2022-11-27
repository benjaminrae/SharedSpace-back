import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { authErrors } from "../../utils/errors";
import httpStatusCodes from "../../utils/httpStatusCodes";
import auth from "./auth";
import type { CustomRequest } from "./types";

const { noTokenError, missingBearerError } = authErrors;

const {
  clientErrors: { unauthorizedCode },
} = httpStatusCodes;

const req: Partial<CustomRequest> = {};

const res: Partial<Response> = {};

const next: NextFunction = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe("Given the auth middleware", () => {
  describe("When it receives a CustomRequest with no auth header", () => {
    test("Then it should invoke next with an error with status 401 and message 'No token provided'", () => {
      const expectedErrorMessage = "No token provided";
      req.header = jest.fn().mockReturnValueOnce(undefined);

      auth(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(noTokenError);
      expect(noTokenError).toHaveProperty("statusCode", unauthorizedCode);
      expect(noTokenError).toHaveProperty(
        "publicMessage",
        expectedErrorMessage
      );
    });
  });

  describe("When it receives a CustomRequest with an auth header that doesn't start with 'Bearer'", () => {
    test("Then it should invoke next with an error with status 401 and message 'Bad token'", () => {
      const expectedErrorMessage = "Bad token";
      req.header = jest.fn().mockReturnValueOnce("");

      auth(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(missingBearerError);
      expect(missingBearerError).toHaveProperty("statusCode", unauthorizedCode);
      expect(missingBearerError).toHaveProperty(
        "publicMessage",
        expectedErrorMessage
      );
    });
  });

  describe("When it receives a CustomRequest with an auth header that has a correct token", () => {
    test("Then it should add the user id to request and invoke next", () => {
      req.header = jest.fn().mockReturnValueOnce("Bearer testtoken");
      const userId = new mongoose.Types.ObjectId();
      jwt.verify = jest.fn().mockReturnValueOnce({ id: userId });

      auth(req as CustomRequest, null, next);

      expect(req).toHaveProperty("userId", userId);
      expect(next).toHaveBeenCalled();
    });
  });
});
