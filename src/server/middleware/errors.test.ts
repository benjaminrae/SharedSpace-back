import type { Response } from "express";
import CustomError from "../../CustomError/CustomError";
import httpStatusCodes from "../utils/httpStatusCodes";
import { generalError } from "./errors";

const {
  serverErrors: { internalServerError },
  clientErrors: { notFoundError },
} = httpStatusCodes;

beforeEach(() => {
  jest.clearAllMocks();
});

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("Given a generalError middleware", () => {
  describe("When it receives a CustomError with message 'Something went wrong', status code 404 and public message 'Something went wrong'", () => {
    test("Then it should invoke response's status method with the received status code and json with the public error message", () => {
      const errorMessage = "Something went wrong";
      const errorStatusCode = notFoundError;
      const customError = new CustomError(
        errorMessage,
        errorStatusCode,
        errorMessage
      );

      generalError(customError, null, res as Response, null);

      expect(res.status).toHaveBeenCalledWith(errorStatusCode);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("When it receives an Error with message 'Something went wrong', no status code and no public message", () => {
    test("Then it should invoke response's status method with 500 and the message 'There was a problem on the server'", () => {
      const errorMessage = "There was a problem on the server";
      const errorStatusCode = internalServerError;
      const error = new Error("Something went wrong");

      generalError(error as CustomError, null, res as Response, null);

      expect(res.status).toHaveBeenCalledWith(errorStatusCode);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
