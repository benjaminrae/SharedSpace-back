import mongoose from "mongoose";
import { validationErrors } from "../../utils/errors";
import httpStatusCodes from "../../utils/httpStatusCodes";
import type { CustomRequest } from "../auth/types";
import validateId from "./validateId";

const req: Partial<CustomRequest> = {
  params: {},
};

const next = jest.fn();

const { invalidIdError } = validationErrors;

const {
  clientErrors: { badRequestCode },
} = httpStatusCodes;

describe("Given a validateId middleware", () => {
  describe("When it receives a request with an invalid id in the requests params", () => {
    test("Then it should invoke next with an error with code 400 and message 'You provided an invalid id'", () => {
      const message = "You provided an invalid id";

      const invalidId = "1234";

      req.params.locationId = invalidId;

      validateId(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalledWith(invalidIdError);
      expect(invalidIdError).toHaveProperty("statusCode", badRequestCode);
      expect(invalidIdError).toHaveProperty("publicMessage", message);
    });
  });

  describe("When it receives a valid id in the request params", () => {
    test("Then it should invoke next", () => {
      const validId = new mongoose.Types.ObjectId().toString();

      req.params.locationId = validId;

      validateId(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
