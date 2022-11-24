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
import type { RegisterUserBody } from "../../schemas/registerUserSchema";

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
  clientErrors: { badRequestCode, unauthorizedCode, conflictsErrorCode },
  successCodes: { okCode, createdCode },
} = httpStatusCodes;

const { usersLoginPath, usersRegisterPath } = paths;

describe("Given a POST /users/login endpoint", () => {
  const errorProperty = "error";
  const wrongCredentialsMessage = "Incorrect username or password";

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

  describe("When it receives a request with the correct username 'admin' and incorrect password 'admin456'", () => {
    test("Then it should respond with status 401 and message 'Incorrect username or password'", async () => {
      const loginBody: UserStructure = {
        username: "admin",
        password: "admin456",
      };

      const response = await request(app)
        .post(usersLoginPath)
        .send(loginBody)
        .expect(unauthorizedCode);

      expect(response.body).toHaveProperty(
        errorProperty,
        wrongCredentialsMessage
      );
    });
  });

  describe("When it receives a request with and incorrect username 'nimda' and password '12345678'", () => {
    test("Then it should response with status 401 and message 'Incorrect username or password'", async () => {
      const loginBody: UserStructure = {
        username: "admin",
        password: "admin456",
      };

      const response = await request(app)
        .post(usersLoginPath)
        .send(loginBody)
        .expect(unauthorizedCode);

      expect(response.body).toHaveProperty(
        errorProperty,
        wrongCredentialsMessage
      );
    });
  });
});

describe("Given a POST /users/register endpoint", () => {
  describe("When it receives a request with username 'admin', password 'admin123' and confirm password 'admin'", () => {
    test("Then it should respond with status 400 and message 'Passwords must match'", async () => {
      const registerBody: RegisterUserBody = {
        username: "admin",
        password: "admin123",
        confirmPassword: "admin",
      };
      const expectedMessage = "Passwords must match";

      const response = await request(app)
        .post(usersRegisterPath)
        .send(registerBody)
        .expect(badRequestCode);

      expect(response.body).toHaveProperty("error", expectedMessage);
    });
  });

  describe("When it receives a request with username 'admin', password 'admin123', confirm password 'admin123' and the username already exists on the server", () => {
    test("Then it should respond with status 409 and message 'That username is taken'", async () => {
      const registerBody: RegisterUserBody = {
        username: "admin",
        password: "admin123",
        confirmPassword: "admin123",
      };
      const expectedMessage = "That username is taken";

      const response = await request(app)
        .post(usersRegisterPath)
        .send(registerBody)
        .expect(conflictsErrorCode);

      expect(response.body).toHaveProperty("error", expectedMessage);
    });
  });

  describe("When it receives a request with unregistered username 'nimda', password 'nimda123' and matching confirm password", () => {
    test("Then it should respond with status 201 and message 'You have registered successfully'", async () => {
      const registerBody: RegisterUserBody = {
        username: "nimda",
        password: "nimda123",
        confirmPassword: "nimda123",
      };
      const message = "You have registered successfully";

      const response = await request(app)
        .post(usersRegisterPath)
        .send(registerBody)
        .expect(createdCode);

      expect(response.body).toStrictEqual({ message });
    });
  });
});
