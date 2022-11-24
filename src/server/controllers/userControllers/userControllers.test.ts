import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserStructure } from "../../../database/models/types";
import User from "../../../database/models/User";
import { loginErrors, registerErrors } from "../../utils/errors";
import httpStatusCodes from "../../utils/httpStatusCodes";
import { loginUser, registerUser } from "./userControllers";
import mongoose from "mongoose";

const {
  clientErrors: { unauthorizedCode },
  successCodes: { okCode },
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
  const loginBody: UserStructure = {
    username: "admin",
    password: "admin123",
  };

  describe("When it receives a request with username 'admin' and password 'admin123' and a next function", () => {
    test("Then it should invoke next with an error with status code 401 and public message 'Incorrect username or password'", async () => {
      const { userNotFoundError } = loginErrors;
      req.body = loginBody;

      User.findOne = jest.fn().mockResolvedValue(null);

      await loginUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(userNotFoundError);
      expect(userNotFoundError).toHaveProperty("statusCode", unauthorizedCode);
      expect(userNotFoundError).toHaveProperty(
        "publicMessage",
        wrongCredentialsMessage
      );
    });
  });

  describe("When it receives a request with username 'admin' and incorrect password 'admin123' and a next function", () => {
    test("Then next should be invoked with an error with status code 401 and public message 'Incorrect username or password'", async () => {
      const { incorrectPasswordError } = loginErrors;
      req.body = loginBody;

      User.findOne = jest.fn().mockResolvedValue(loginBody);

      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await loginUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(incorrectPasswordError);
      expect(incorrectPasswordError).toHaveProperty(
        "statusCode",
        unauthorizedCode
      );
      expect(incorrectPasswordError).toHaveProperty(
        "publicMessage",
        wrongCredentialsMessage
      );
    });
  });

  describe("When it receives a request with username 'admin' and correct password 'admin123' and a response", () => {
    test("Then it should invoke responses status method with 200 and json method with a token", async () => {
      const token = "testtoken";
      const id = new mongoose.Types.ObjectId();
      req.body = loginBody;

      User.findOne = jest.fn().mockResolvedValue({ ...loginBody, _id: id });

      bcrypt.compare = jest.fn().mockResolvedValue(true);

      jwt.sign = jest.fn().mockReturnValue(token);

      await loginUser(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({ token });
    });
  });

  describe("When it receives a request with username 'admin' and password 'admin123' and User.findOne rejects", () => {
    test("Then next shpuld be invoked with the thrown error", async () => {
      req.body = loginBody;
      const error = new Error("");

      User.findOne = jest.fn().mockRejectedValue(error);

      await loginUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Given a registerUser controller", () => {
  describe("When it receives a request with username 'admin' and password 'admin123'", () => {
    test("Then it should invoke response's status method with 201", async () => {
      const registerBody: UserStructure = {
        username: "admin",
        password: "admin123",
      };
      req.body = registerBody;
      const hashedPassword = "hashedpassword";
      const expectedStatus = 201;

      bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

      User.create = jest.fn();

      await registerUser(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });

  describe("When it receives a request with username 'nimda' and password 'nimda123' but the username already exists", () => {
    test("Then it should invoke next with an error with status 409 and message 'That username is taken'", async () => {
      const registerBody: UserStructure = {
        username: "nimda",
        password: "nimda123",
      };
      req.body = registerBody;
      const hashedPassword = "hashedpassword";
      const error = new Error("duplicate key");
      const expectedStatus = 409;
      const expectedMessage = "That username is taken";

      bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

      User.create = jest.fn().mockRejectedValueOnce(error);

      await registerUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(registerErrors.alreadyRegisteredError);
      expect(registerErrors.alreadyRegisteredError).toHaveProperty(
        "statusCode",
        expectedStatus
      );
      expect(registerErrors.alreadyRegisteredError).toHaveProperty(
        "publicMessage",
        expectedMessage
      );
    });
  });

  describe("When it receives a request with username 'admin' and password 'admin123', a next function and bcrypt rejects", () => {
    test("Then it should invoke next with the thrown error", async () => {
      const registerBody: UserStructure = {
        username: "nimda",
        password: "nimda123",
      };
      req.body = registerBody;
      const error = new Error("");

      bcrypt.hash = jest.fn().mockRejectedValueOnce(error);

      await registerUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
