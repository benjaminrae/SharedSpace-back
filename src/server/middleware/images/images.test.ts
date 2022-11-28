import fs from "fs/promises";
import type { NextFunction } from "express";
import { getRandomLocation } from "../../../factories/locationsFactory";
import type { CustomRequest } from "../auth/types";
import { backupImages, renameImages } from "./images";
import { bucket } from "../../utils/supabaseConfig";
import getUploadPath from "../../utils/getUploadPath/getUploadPath";

const newLocation = getRandomLocation();
delete newLocation.images.backup;
delete newLocation.images.backupSmall;

const req: Partial<CustomRequest> = {
  body: newLocation,
};

const next: NextFunction = jest.fn();

const timestamp = Date.now();
jest.useFakeTimers();
jest.setSystemTime(timestamp);

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
    await fs.mkdir("uploads");
    await fs.writeFile(getUploadPath("filehash"), Buffer.from(""));
  });

  afterEach(async () => {
    await fs.rm("uploads", { recursive: true, force: true });
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
        filename: "filehash",
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
