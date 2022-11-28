import type { Express } from "express";
import type { CustomRequest } from "../../middleware/auth/types";
import { imageErrors } from "../errors";
import httpStatusCodes from "../httpStatusCodes";
import fileFilter from "./fileFilter";

const {
  clientErrors: { badRequestCode },
} = httpStatusCodes;
const req: Partial<CustomRequest> = {};

const callback = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given the function fileFilter", () => {
  describe("When it receives a custom request, no image file and a file filter callback", () => {
    test("Then it should invoke the callback with null and false", () => {
      fileFilter(req as CustomRequest, undefined, callback);

      expect(callback).toHaveBeenCalledWith(null, false);
    });
  });

  describe("When it receives a customRequest, a file video.mp4 and a file filter callback", () => {
    test("Then it should invoke the callback with an imageFormatError with status 400 and message 'Wrong image format. Accepeted formats: png, jpg, jpeg, avif and webp'", () => {
      const file: Partial<Express.Multer.File> = {
        mimetype: "mp4",
        originalname: "video.mp4",
      };
      const statusProperty = "statusCode";
      const messageProperty = "publicMessage";
      const expectedMessage =
        "Wrong image format. Accepeted formats: png, jpg, jpeg, avif and webp";

      fileFilter(req as CustomRequest, file as Express.Multer.File, callback);

      expect(callback).toHaveBeenCalledWith(imageErrors.imageFormatError);
      expect(imageErrors.imageFormatError).toHaveProperty(
        messageProperty,
        expectedMessage
      );
      expect(imageErrors.imageFormatError).toHaveProperty(
        statusProperty,
        badRequestCode
      );
    });
  });
});
