import type { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import Location from "../../../database/models/Location";
import {
  getRandomLocation,
  getRandomLocations,
} from "../../../factories/locationsFactory";
import type { CustomRequest } from "../../middleware/auth/types";
import httpStatusCodes from "../../utils/httpStatusCodes";
import { addLocation, getLocations } from "./locationsControllers";

const {
  successCodes: { createdCode, okCode },
} = httpStatusCodes;

const req: Partial<CustomRequest> = {
  protocol: "http",
  get: jest.fn().mockReturnValue("localhost:4000"),
};

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
  } in the body and the files are stored locally`, () => {
    test("Then it should respond with status 201 and the new location without the backup images", async () => {
      const expectedResponse = { ...newLocation };

      req.userId = newLocation.owner.toString();
      req.body = newLocation;

      const image = `${req.protocol}://${req.get("host")}/${
        expectedResponse.images.image
      }`;
      const small = `${req.protocol}://${req.get("host")}/${
        expectedResponse.images.small
      }`;

      Location.create = jest.fn().mockReturnValueOnce({
        ...newLocation,
        images: {
          image,
          small,
        },

        // eslint-disable-next-line @typescript-eslint/naming-convention
        toJSON: jest.fn().mockReturnValueOnce({
          ...newLocation,
          images: {
            image,
            small,
          },
        }),
      });

      fs.open = jest
        .fn()
        .mockResolvedValue({ close: jest.fn().mockResolvedValue(true) });

      await addLocation(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(createdCode);
      expect(res.json).toHaveBeenCalledWith({
        location: {
          ...expectedResponse,
          images: {
            image: `${req.protocol}://${req.get("host")}/${
              expectedResponse.images.image
            }`,
            small: `${req.protocol}://${req.get("host")}/${
              expectedResponse.images.small
            }`,
          },
        },
      });
    });
  });

  describe(`When it receives a CustomRequest with userId ${newLocation.owner.toString()} and location ${
    newLocation.name
  } in the body and the files are not stored locally`, () => {
    test("Then it should respond with status 201 and the new location with the backup images", async () => {
      const expectedResponse = { ...newLocation };

      req.userId = newLocation.owner.toString();
      req.body = newLocation;

      Location.create = jest.fn().mockReturnValueOnce({
        ...newLocation,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        toJSON: jest.fn().mockReturnValueOnce(newLocation),
      });

      fs.open = jest.fn().mockRejectedValue(false);

      await addLocation(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(createdCode);
      expect(res.json).toHaveBeenCalledWith({
        location: {
          ...expectedResponse,
          images: {
            image: expectedResponse.images.backup,
            small: expectedResponse.images.backupSmall,
          },
        },
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

describe("Given a getLocations controller", () => {
  describe("When it receives a req and a response and there are 3 locations in the database", () => {
    test("Then it should invoked response's status method with 200 and json with a list with the 3 locations, count 0, next null and previous null", async () => {
      const total = 3;
      const locations = getRandomLocations(total);
      req.query = {};

      Location.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            exec: jest.fn().mockReturnValue(locations),
          }),
        }),
      });

      Location.countDocuments = jest.fn().mockResolvedValue(total);

      await getLocations(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({
        count: total,
        next: null,
        previous: null,
        locations,
      });
    });
  });

  describe("When it receives a request with query page=2 and there are 30 locations in the database", () => {
    test("Then it should invoke response's method json with next a link with page=3 and previous a link with page=1", async () => {
      req.query = { page: "2" };
      req.protocol = "http";
      req.url = "/locations";
      const host = "sharedspace.com";
      req.get = jest.fn().mockReturnValue(host);
      const nextUrl = `${req.protocol}://${host}${req.url}?page=3&limit=10`;
      const previous = `${req.protocol}://${host}${req.url}?page=1&limit=10`;
      const total = 30;
      const locations = getRandomLocations(total);

      Location.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            exec: jest.fn().mockReturnValue(locations),
          }),
        }),
      });

      Location.countDocuments = jest.fn().mockResolvedValue(total);

      await getLocations(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        locations,
        count: total,
        next: nextUrl,
        previous,
      });
    });
  });

  describe("When it receives a request and a next function and the database query fails", () => {
    test("Then it should call next with the thrown error", async () => {
      const error = new Error("");

      Location.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(error),
          }),
        }),
      });

      await getLocations(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
