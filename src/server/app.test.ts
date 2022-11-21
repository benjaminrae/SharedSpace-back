import request from "supertest";
import app from "./app";
import httpStatusCodes from "./utils/httpStatusCodes";

const {
  clientErrors: { notFoundError },
} = httpStatusCodes;

describe("Given the GET /hello endpoint", () => {
  describe("When it receives a request", () => {
    test("Then it should respond with status 404 and message 'Unknown Endpoint'", async () => {
      const unknownEndpoint = "/hello";
      const expectedProperty = "error";
      const expectedMessage = "Unknown Endpoint";

      const response = await request(app)
        .get(unknownEndpoint)
        .expect(notFoundError);

      expect(response.body).toHaveProperty(expectedProperty, expectedMessage);
    });
  });
});
