import request from "supertest";
import type { UserStructure } from "../../../database/models/types";
import app from "../../app";
import httpStatusCodes from "../../utils/httpStatusCodes";
import paths from "../paths";

const {
  clientErrors: { badRequestCode },
} = httpStatusCodes;

const { usersLoginPath } = paths;

describe("Given a POST /users/login endpoint", () => {
  const errorProperty = "error";

  describe("When it receives a request with username 'admi' that is too short and password 'admin123'", () => {
    test("Then it should respond with status 400 and message 'Username must have 5 characters minimum'", async () => {
      const loginBody: UserStructure = {
        username: "admi",
        password: "admin123",
      };
      const errorMessage = "Username must have 5 characters minimum";

      const response = await request(app)
        .post(usersLoginPath)
        .send(loginBody)
        .expect(badRequestCode);

      expect(response.body).toHaveProperty(errorProperty, errorMessage);
    });
  });

  describe("When it receives a request with username 'admin' and an empty password", () => {
    test("Then it should respond with status 400 and message 'Password is required'", async () => {
      const loginBody: UserStructure = {
        username: "admin",
        password: "",
      };
      const errorMessage = "Password is required";

      const response = await request(app)
        .post(usersLoginPath)
        .send(loginBody)
        .expect(badRequestCode);

      expect(response.body).toHaveProperty(errorProperty, errorMessage);
    });
  });
});
