import type { Request, Response, NextFunction } from "express";
import type { UserStructure } from "../../../database/models/types";
import User from "../../../database/models/User";
import { loginErrors } from "../../utils/errors";
import httpStatusCodes from "../../utils/httpStatusCodes";
import { loginUser } from "./userControllers";

const {
  clientErrors: { unauthorizedCode },
} = httpStatusCodes;

beforeEach(() => {
  jest.clearAllMocks();
});

const req: Partial<Request> = {};

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

const next = jest.fn();

describe("Given a loginUser controller", () => {
  const wrongCredentialsMessage = "Incorrect username or password";

  describe("When it receives a request with username 'admin' and password 'admin123' and a next function", () => {
    test("Then it should invoke next with an error with status code 401 and public message 'Incorrect username or password'", async () => {
      const { userNotFoundError } = loginErrors;
      const loginBody: UserStructure = {
        username: "admin",
        password: "admin123",
      };
      req.body = loginBody;

      User.find = jest.fn().mockResolvedValue(null);

      await loginUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(userNotFoundError);
      expect(userNotFoundError).toHaveProperty("statusCode", unauthorizedCode);
      expect(userNotFoundError).toHaveProperty(
        "publicMessage",
        wrongCredentialsMessage
      );
    });
  });
});
