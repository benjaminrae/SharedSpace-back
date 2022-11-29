import fs from "fs/promises";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import connectDatabase from "../../../database/connectDatabase";
import Location from "../../../database/models/Location";
import {
  getRandomLocation,
  getRandomLocations,
} from "../../../factories/locationsFactory";
import mockToken from "../../../mocks/mockToken";
import app from "../../app";
import type { LocationStructure } from "../../controllers/locationsControllers/types";
import getUploadPath from "../../utils/getUploadPath/getUploadPath";
import httpStatusCodes from "../../utils/httpStatusCodes";
import paths from "../paths";

const {
  locationsAddPath,
  partialPaths: { locationsPath },
} = paths;

const {
  successCodes: { createdCode, okCode },
} = httpStatusCodes;

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
  const locations = getRandomLocations(3);
  beforeEach(async () => {
    await Location.create(locations);
  });

  describe("When it recieves a request and there are 3 locations in the database", () => {
    test("Then it should respond with those 3 locations", async () => {
      const expectedLocations = 3;

      const response: { body: { locations: LocationStructure[] } } =
        await request(app).get(locationsPath).expect(okCode);

      expect(response.body.locations).toHaveLength(expectedLocations);
    });
  });
});
