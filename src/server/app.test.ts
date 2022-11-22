import request from "supertest";
import app from "./app";
import httpStatusCodes from "./utils/httpStatusCodes";

const {
  clientErrors: { notFoundError, badRequest },
} = httpStatusCodes;

describe("Given the GET /hello endpoint", () => {
  const unknownEndpoint = "/hello";
  const expectedProperty = "error";

  describe("When it receives a request", () => {
    test("Then it should respond with status 404 and message 'Unknown Endpoint'", async () => {
      const expectedMessage = "Unknown Endpoint";

      const response = await request(app)
        .get(unknownEndpoint)
        .expect(notFoundError);

      expect(response.body).toHaveProperty(expectedProperty, expectedMessage);
    });
  });

  describe("When it receives a request from an origin that is not on the whitelist", () => {
    test("Then it should respond with status 400 and message 'Not allowed by CORS'", async () => {
      const expectedMessage = "Not allowed by CORS";
      const unknownOrigin = "http://localhost:1234";

      const response = await request(app)
        .get(unknownEndpoint)
        .set("origin", unknownOrigin)
        .expect(badRequest);

      expect(response.body).toHaveProperty(expectedProperty, expectedMessage);
    });
  });
});
