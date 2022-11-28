import fs from "fs/promises";
import type { NextFunction } from "express";
import { getRandomLocation } from "../../../factories/locationsFactory";
import type { CustomRequest } from "../auth/types";
import { backupImages } from "./images";
import { bucket } from "../../utils/supabaseConfig";

const newLocation = getRandomLocation();
delete newLocation.images.backup;
delete newLocation.images.backupSmall;

const req: Partial<CustomRequest> = {
  body: newLocation,
};

const next: NextFunction = jest.fn();

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
