import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserStructure } from "../../../database/models/types";
import app from "../../app";
import httpStatusCodes from "../../utils/httpStatusCodes";
import paths from "../paths";
import connectDatabase from "../../../database/connectDatabase";
import mongoose from "mongoose";
import User from "../../../database/models/User";
import { environment } from "../../../loadEnvironment";
import type { CustomTokenPayload } from "../../controllers/userControllers/types";

const { saltLength } = environment;

let server: MongoMemoryServer;

const loginBody: UserStructure = {
  username: "admin",
  password: "admin123",
};

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  await connectDatabase(server.getUri());

  const hashedPassword = await bcrypt.hash(loginBody.password, saltLength);

  await User.create({ username: loginBody.username, password: hashedPassword });
});

afterAll(async () => {
  await server.stop();
  await mongoose.connection.close();
});

const {
  clientErrors: { badRequestCode },
  successCodes: { okCode },
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

  describe("When it receives the correct username and password 'admin' and 'admin123'", () => {
    test("Then it should respond with status 200 and a token with the user's username and id in the payload", async () => {
      const tokenProperty = "token";
      const usernameProperty = "username";
      const idProperty = "id";

      const response = await request(app)
        .post(usersLoginPath)
        .send(loginBody)
        .expect(okCode);

      expect(response.body).toHaveProperty(tokenProperty);

      const { token } = response.body as { token: string };

      const tokenPayload = jwt.decode(token);

      expect(tokenPayload as CustomTokenPayload).toHaveProperty(
        usernameProperty,
        loginBody.username
      );
      expect(tokenPayload as CustomTokenPayload).toHaveProperty(idProperty);
    });
  });
});
