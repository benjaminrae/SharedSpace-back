import fs from "fs/promises";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import connectDatabase from "../../../database/connectDatabase";
import Location from "../../../database/models/Location";
import User from "../../../database/models/User";
import {
  getRandomLocation,
  getRandomLocations,
} from "../../../factories/locationsFactory";
import { environment } from "../../../loadEnvironment";
import mockToken from "../../../mocks/mockToken";
import app from "../../app";
import type {
  LocationStructure,
  LocationWithIdStructure,
} from "../../controllers/locationsControllers/types";
import type { CustomTokenPayload } from "../../controllers/userControllers/types";
import getUploadPath from "../../utils/getUploadPath/getUploadPath";
import httpStatusCodes from "../../utils/httpStatusCodes";
import paths from "../paths";

const {
  locationsAddPath,
  getMyLocationsPath,
  deleteLocationPath,
  partialPaths: { locationsPath },
} = paths;

const {
  successCodes: { createdCode, okCode },
} = httpStatusCodes;

const { jwtSecret } = environment;

const newLocation = getRandomLocation();

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create({});
  await connectDatabase(server.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.stop();
});

describe("Given a POST /locations/add endpoint", () => {
  afterEach(async () => {
    await Location.deleteMany({});
  });

  describe(`When it receives a request with ${newLocation.name}, ${newLocation.location} and an image`, () => {
    test("Then it should respond with status 201 and the created location in the body with a normal image and a small image", async () => {
      const timeStamp = Date.now();
      Date.now = jest.fn().mockReturnValue(timeStamp);
      const fileData = await fs.readFile(getUploadPath("mockImage.jpg"));
      const expectedFileName = `mockImage-${timeStamp}.webp`;
      const expectedSmallFileName = `small-mockImage-${timeStamp}.webp`;

      const response: { body: { location: LocationStructure } } = await request(
        app
      )
        .post(locationsAddPath)
        .set("Authorization", mockToken)
        .field("name", newLocation.name)
        .field("location", newLocation.location)
        .field("description", newLocation.description)
        .attach("image", fileData, `${__dirname}/mockImage.jpg`)
        .expect(createdCode);

      expect(response.body).toHaveProperty("location");

      const {
        body: {
          location: {
            images: { image, small },
          },
        },
      } = response;

      expect(image).toContain(expectedFileName);
      expect(small).toContain(expectedSmallFileName);
    });
  });
});

describe("Given a GET /locations endpoint", () => {
  const expectedLocations = 30;
  const locations = getRandomLocations(expectedLocations);
  beforeEach(async () => {
    await Location.create(locations);
  });

  describe("When it recieves a request with query page=2 and limit=10 and there are 40 locations in the database", () => {
    test("Then it should respond with count 40, next a link with page=3, previous a link with page=1 and only 10 locations", async () => {
      const page = 2;
      const limit = 10;
      const response: {
        body: {
          count: number;
          next: string;
          previous: string;
          locations: LocationStructure[];
        };
      } = await request(app)
        .get(`${locationsPath}?page=${page}`)
        .expect(okCode);

      const { count, locations, next, previous } = response.body;

      expect(locations).toHaveLength(limit);
      expect(count).toBe(expectedLocations);
      expect(next).toContain(`page=${page + 1}`);
      expect(previous).toContain(`page=${page - 1}`);
    });
  });
});

describe("Given a GET /locations/my-locations endpoint", () => {
  const count = 30;
  const locations = getRandomLocations(30);
  let userToken: string;
  let userLocations: LocationStructure[];

  beforeAll(async () => {
    const user = await User.create({
      owner: true,
      password: "password",
      username: "admin",
    });
    userToken = jwt.sign(
      {
        id: user._id.toString(),
        owner: true,
        username: "admin",
      } as CustomTokenPayload,
      jwtSecret
    );

    userLocations = locations.map((location) => ({
      ...location,
      owner: user._id,
    }));
    await Location.create(userLocations);
  });

  afterAll(async () => {
    await Location.deleteMany({});
  });

  describe("When it receives a request with an authentication token and the user has 30 locations in the databse", () => {
    test("Then it should return count 30, next with page=2 previous null and 30 locations", async () => {
      const limit = 10;

      const response: {
        body: {
          count: number;
          next: string;
          previous: string;
          locations: LocationStructure[];
        };
      } = await request(app)
        .get(getMyLocationsPath)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(okCode);

      expect(response.body.count).toBe(count);
      expect(response.body.next).toContain("page=2");
      expect(response.body.locations).toHaveLength(limit);
    });
  });
});

describe("Given a DELETE /locations/delete-location/:locationId endpoint", () => {
  const location = getRandomLocation();
  let userToken: string;
  let storedLocation: LocationWithIdStructure;

  beforeAll(async () => {
    const user = await User.create({
      owner: true,
      password: "password",
      username: "new_user",
    });
    userToken = jwt.sign(
      {
        id: user._id.toString(),
        owner: true,
        username: "admin",
      } as CustomTokenPayload,
      jwtSecret
    );
    location.owner = user._id;
    storedLocation = await Location.create(location);
  });

  describe("When it receives an authorized request and a location id that exists in the database", () => {
    test("Then it should response with status 200 and the message 'Location deleted successfully'", async () => {
      const message = "Location deleted successfully";

      const response = await request(app)
        .delete(`${deleteLocationPath}/${storedLocation._id.toString()}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(okCode);

      expect(response.body).toStrictEqual({ message });
    });
  });
});
