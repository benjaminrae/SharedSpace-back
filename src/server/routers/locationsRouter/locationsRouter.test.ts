import fs from "fs/promises";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import connectDatabase from "../../../database/connectDatabase";
import { getRandomLocation } from "../../../factories/locationsFactory";
import mockToken from "../../../mocks/mockToken";
import app from "../../app";
import type { LocationStructure } from "../../controllers/locationsControllers/types";
import cleanUploads from "../../utils/files/cleanUploads";
import httpStatusCodes from "../../utils/httpStatusCodes";
import paths from "../paths";

const { locationsAddPath } = paths;

const {
  successCodes: { createdCode },
} = httpStatusCodes;

const newLocation = getRandomLocation();

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  await connectDatabase(server.getUri());
});

afterAll(async () => {
  await server.stop();
  await mongoose.connection.close();

  await cleanUploads();
});

describe("Given a POST /locations/add endpoint", () => {
  describe(`When it receives a request with ${newLocation.name}, ${newLocation.location} and an image`, () => {
    test("Then it should respond with status 201 and the created location in the body with a normal image and a small image", async () => {
      const timeStamp = Date.now();
      Date.now = jest.fn().mockReturnValue(timeStamp);
      const fileData = await fs.readFile("src/mocks/mockImage.jpg");
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
