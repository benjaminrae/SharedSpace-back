import fs from "fs/promises";
import { getRandomLocation } from "../../../factories/locationsFactory";
import type { CustomRequest } from "../auth/types";
import {
  backupImages,
  renameImages,
  resizeImages,
  serveFallbackImage,
} from "./images";
import { bucket } from "../../utils/supabaseConfig";
import getUploadPath from "../../utils/getUploadPath/getUploadPath";
import path from "path";
import type { LocationStructure } from "../../controllers/locationsControllers/types";
import type { Response } from "express";

const newLocation = getRandomLocation();
delete newLocation.images.backup;
delete newLocation.images.backupSmall;

const file: Partial<Express.Multer.File> = {};

const req: Partial<
  CustomRequest<
    Record<string, unknown>,
    Record<string, unknown>,
    LocationStructure
  >
> = {
  body: newLocation,
  file: file as Express.Multer.File,
};

const next = jest.fn();

const timestamp = Date.now();
jest.useFakeTimers();
jest.setSystemTime(timestamp);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given a backupImages middleware", () => {
  const mainFile = Buffer.from("main");
  const smallFile = Buffer.from("small");

  describe("When it receives a CustomRequest with a new location", () => {
    test("Then it should add the backup images to the request body and invoke next", async () => {
      const mainFileUrl = "supabase.com/main.jpg";
      const smallFileUrl = "supabase.com/small.jpg";
      const mainFileProperty = "backup";
      const smallFileProperty = "backupSmall";

      fs.readFile = jest
        .fn()
        .mockResolvedValueOnce(mainFile)
        .mockResolvedValueOnce(smallFile);

      bucket.upload = jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      bucket.getPublicUrl = jest
        .fn()
        .mockReturnValueOnce({ data: { publicUrl: mainFileUrl } })
        .mockReturnValueOnce({ data: { publicUrl: smallFileUrl } });

      await backupImages(req as CustomRequest, null, next);

      expect(req.body.images).toHaveProperty(mainFileProperty, mainFileUrl);
      expect(req.body.images).toHaveProperty(smallFileProperty, smallFileUrl);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("When it receives a CustomRequest with a new Location but upload to supabase fails", () => {
    test("Then next should be called with the thrown error", async () => {
      const error = new Error("Can't upload to Supabase");

      fs.readFile = jest
        .fn()
        .mockResolvedValueOnce(mainFile)
        .mockResolvedValueOnce(smallFile);

      bucket.upload = jest.fn().mockRejectedValue(error);

      await backupImages(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Given a renameImages middleware", () => {
  const expectedFileName = `image-${timestamp}.jpg`;

  beforeEach(async () => {
    await fs.writeFile(getUploadPath("filehash"), Buffer.from(""));
  });

  describe("When it receives a CustomRequest with an image file 'image.jpg'", () => {
    test("Then it should rename the file by adding a time stamp to the original name and invoke next", async () => {
      const file: Partial<Express.Multer.File> = {
        filename: "filehash",
        originalname: "image.jpg",
        path: getUploadPath("filehash"),
      };

      req.file = file as Express.Multer.File;

      await renameImages(req as CustomRequest, null, next);

      expect(req.file.filename).toBe(expectedFileName);
    });
  });

  describe("When it receives a CustomRequest with an image file 'image.jpg' and fs rejects", () => {
    test("Then it should invoked next with the thrown error", async () => {
      const file: Partial<Express.Multer.File> = {
        filename: "image.jpg",
        originalname: "image.jpg",
        path: getUploadPath("filehash"),
      };

      req.file = file as Express.Multer.File;

      const error = new Error("");
      fs.rename = jest.fn().mockRejectedValueOnce(error);

      await renameImages(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Given a resizeImages middleware", () => {
  beforeEach(async () => {
    const testImageLocation = path.join(getUploadPath("mockImage.jpg"));
    await fs.copyFile(testImageLocation, getUploadPath("image.jpg"));
  });

  describe("When it receives a CustomRequest with an image file", () => {
    const smallFileName = "small-image.webp";
    const mainFileName = "image.webp";

    test("Then it should add the files to the body of the request and invoke next", async () => {
      await resizeImages(req as CustomRequest, null, next);

      expect(req.body.images).toHaveProperty(
        "image",
        getUploadPath(mainFileName)
      );
      expect(req.body.images).toHaveProperty(
        "small",
        getUploadPath(smallFileName)
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe("When it receives a CustomRequest with an unreadable file", () => {
    const unreadableImage = "unreadable.jpg";

    beforeEach(async () => {
      await fs.writeFile(getUploadPath(unreadableImage), Buffer.from(""));
    });

    test("Then it should call next", async () => {
      req.file.filename = getUploadPath(unreadableImage);

      await resizeImages(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

describe("Given a serveFallbackImage middleware", () => {
  const res: Partial<Response> = {
    redirect: jest.fn(),
  };

  describe("When it receives a request with a path that starts with /uploads", () => {
    test("Then it should invoked the response's redirect method with the supabase url", () => {
      const requestUrl = "/uploads/image.jpg";
      req.originalUrl = requestUrl;
      const publicUrl = `www.supabase.com${requestUrl}`;

      bucket.getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl } });

      serveFallbackImage(req as CustomRequest, res as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(publicUrl);
    });
  });
});
