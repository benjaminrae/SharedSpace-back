import type { Response } from "express";
import CustomError from "../../CustomError/CustomError";
import { generalError } from "./errors";

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("Given a generalError middleware", () => {
  describe("When it receives a CustomError with message 'Something went wrong', status code 404 and public message 'Something went wrong'", () => {
    test("Then it should invoked response's status method with the received status code and json with the public error message", () => {
      const errorMessage = "Something went wrong";
      const errorStatusCode = 404;
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
});
