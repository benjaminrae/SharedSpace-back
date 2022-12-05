import type { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import Location from "../../../database/models/Location";
import {
  getRandomLocation,
  getRandomLocations,
} from "../../../factories/locationsFactory";
import type { CustomRequest } from "../../middleware/auth/types";
import { authErrors, locationErrors } from "../../utils/errors";
import httpStatusCodes from "../../utils/httpStatusCodes";
import {
  addLocation,
  deleteLocationById,
  getLocationById,
  getLocations,
  getMyLocations,
  updateLocation,
} from "./locationsControllers";

const { locationNotFoundError } = locationErrors;

const {
  successCodes: { createdCode, okCode },
  clientErrors: { forbiddenCode, notFoundErrorCode },
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
      req.baseUrl = "/locations";
      const host = "sharedspace.com";
      req.get = jest.fn().mockReturnValue(host);
      const nextUrl = `${req.protocol}://${host}${req.baseUrl}?page=3&limit=10`;
      const previous = `${req.protocol}://${host}${req.baseUrl}?page=1&limit=10`;
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

describe("Given a getMyLocations controller", () => {
  describe("When it receives a custom request with userId and the user has 1 location in the database", () => {
    test("Then it should invoke response's status with 200 and json with count 1, next: null, previous null and 1 location", async () => {
      const count = 1;
      const location = getRandomLocation();
      req.userId = location.owner.toString();
      req.query = {};

      Location.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            exec: jest.fn().mockReturnValue([location]),
          }),
        }),
      });

      Location.countDocuments = jest.fn().mockResolvedValue(count);

      await getMyLocations(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({
        count,
        next: null,
        previous: null,
        locations: [location],
      });
    });
  });

  describe("When it receives a custom request with userId  and query page=2 and the user has 30 locations in the database", () => {
    test("Then it should invoke response's status with 200 and json with count 30, next, previous and 30 locations", async () => {
      const count = 30;
      req.protocol = "http";
      req.url = "/locations";
      const host = "sharedspace.com";
      req.get = jest.fn().mockReturnValue(host);
      const nextUrl = `${req.protocol}://${host}${req.url}?page=3&limit=10`;
      const previous = `${req.protocol}://${host}${req.url}?page=1&limit=10`;
      const locations = getRandomLocations(30);
      req.userId = locations[0].owner.toString();
      req.query = {
        page: "2",
      };

      Location.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            exec: jest.fn().mockReturnValue(locations),
          }),
        }),
      });

      Location.countDocuments = jest.fn().mockResolvedValue(count);

      await getMyLocations(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({
        count,
        next: nextUrl,
        previous,
        locations,
      });
    });
  });

  describe("When it receives a request and a next function and the database query fails", () => {
    test("Then it should call next with the thrown error", async () => {
      const error = new Error("");

      req.userId = "id";

      Location.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(error),
          }),
        }),
      });

      await getMyLocations(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Given a deleteLocationById controller", () => {
  describe("When it receives a request from user id '1234' to delete a location but the owner id is '5678'", () => {
    test("Then it should invoke next with an error with code 403 and message 'That action is forbidden'", async () => {
      const { forbiddenError } = authErrors;
      const message = "That action is forbidden";
      req.userId = "1234";
      req.params = {
        locationId: "locationid",
      };

      Location.findOne = jest.fn().mockResolvedValue({
        owner: { toString: jest.fn().mockReturnValue("5678") },
      });

      await deleteLocationById(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(forbiddenError);
      expect(forbiddenError).toHaveProperty("statusCode", forbiddenCode);
      expect(forbiddenError).toHaveProperty("publicMessage", message);
    });
  });

  describe("When it receives a request from userId '1234' and the user is the owner of the location", () => {
    test("Then it should invoke response's status with 200 and json with the message 'Location deleted successfully", async () => {
      req.userId = "1234";
      const location = getRandomLocation();
      req.params = {
        locationId: "locationid",
      };
      const message = "Location deleted successfully";

      Location.findOne = jest.fn().mockResolvedValue({
        owner: { toString: jest.fn().mockReturnValue("1234") },
        delete: jest.fn().mockResolvedValue(undefined),
        location,
      });

      await deleteLocationById(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({ message });
    });
  });

  describe("When it receives a request to delete a location but the database query fails", () => {
    test("Then it should invoke next with the thrown error", async () => {
      req.userId = "1234";
      req.params = {
        locationId: "locationid",
      };
      const error = new Error("");

      Location.findOne = jest.fn().mockResolvedValue({
        owner: { toString: jest.fn().mockReturnValue("1234") },
        delete: jest.fn().mockRejectedValue(error),
      });

      await deleteLocationById(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Given a getLocationById controller", () => {
  describe("When it receives a request with id '1234'", () => {
    test("Then it should invoke response's status method with 200 and json with the found location", async () => {
      const locationId = "1234";
      req.params = { locationId };

      const location = getRandomLocation();

      Location.findById = jest.fn().mockResolvedValue(location);

      await getLocationById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({ location });
    });
  });

  describe("When it receives a request with id '5678 and the location isn't found", () => {
    test("Then it should invoke next with an error with status 404 and message 'Location not found'", async () => {
      const locationId = "5678";
      req.params = { locationId };
      const message = "Location not found";

      Location.findById = jest.fn().mockResolvedValue(null);

      await getLocationById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(locationNotFoundError);
      expect(locationNotFoundError).toHaveProperty(
        "statusCode",
        notFoundErrorCode
      );
      expect(locationNotFoundError).toHaveProperty("publicMessage", message);
    });
  });

  describe("When it receives a request with id '1234' and the database query fails", () => {
    test("Then it should invoke next with the thrown error", async () => {
      const locationId = "1234";
      req.params = { locationId };

      const error = new Error("");

      Location.findById = jest.fn().mockRejectedValue(error);

      await getLocationById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("Given the updateLocation controller", () => {
  const updatedLocation = getRandomLocation();
  const { services } = updatedLocation;

  const uploadedLocation = {
    ...updatedLocation,
    services: JSON.stringify(services),
  };

  describe("When it receives a request with a location and id '1234'", () => {
    test("Then it should respond with status 200 and the updated location", async () => {
      req.body = uploadedLocation;

      req.params = {
        locationId: "1234",
      };

      Location.findByIdAndUpdate = jest
        .fn()
        .mockReturnValueOnce(updatedLocation);

      await updateLocation(req as CustomRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(okCode);
      expect(res.json).toHaveBeenCalledWith({
        location: updatedLocation,
      });
    });
  });

  describe("When it receives a request and the databse query fails", () => {
    test("Then next should be called with the thrown error", async () => {
      req.body = updatedLocation;

      const error = new Error("");

      Location.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

      await updateLocation(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
