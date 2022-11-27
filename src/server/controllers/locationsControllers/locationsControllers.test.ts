import type { Response, NextFunction } from "express";
import Location from "../../../database/models/Location";
import { getRandomLocation } from "../../../factories/locationsFactory";
import type { CustomRequest } from "../../middleware/auth/types";
import httpStatusCodes from "../../utils/httpStatusCodes";
import { addLocation } from "./locationsControllers";

const {
  successCodes: { createdCode },
} = httpStatusCodes;

const req: Partial<CustomRequest> = {};

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

const next: NextFunction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given an addLocation controller", () => {
  const newLocation = getRandomLocation();

  describe(`When it receives a CustomRequest with userId ${newLocation.owner.toString()} and location ${
    newLocation.name
  } in the body`, () => {
    test("Then it should respod with status 201 and the new location without the backup images", async () => {
      const expectedResponse = { ...newLocation };
      delete expectedResponse.images.backup;
      delete expectedResponse.images.backupSmall;

      req.userId = newLocation.owner.toString();
      req.body = newLocation;

      Location.create = jest.fn().mockReturnValueOnce({
        ...newLocation,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        toJSON: jest.fn().mockReturnValueOnce(newLocation),
      });

      await addLocation(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(createdCode);
      expect(res.json).toHaveBeenCalledWith({
        location: expectedResponse,
      });
    });
  });

  describe(`When it receives a CustomRequest with userId ${newLocation.owner.toString()} and location ${
    newLocation.name
  } in the body but document creation rejects`, () => {
    test("Then next should be called with the thrown error", async () => {
      req.userId = newLocation.owner.toString();
      req.body = newLocation;

      const error = new Error("");
      Location.create = jest.fn().mockRejectedValue(error);

      await addLocation(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
