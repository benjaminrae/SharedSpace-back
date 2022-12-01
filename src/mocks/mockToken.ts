import jwt from "jsonwebtoken";
import type { CustomTokenPayload } from "../server/controllers/userControllers/types";
import { environment } from "../loadEnvironment";

const { jwtSecret } = environment;

const tokenPayload: CustomTokenPayload = {
  username: "admin",
  id: "637ca68b2e7c24060c5c7e20",
  owner: true,
};

const token = jwt.sign(tokenPayload, jwtSecret);

const mockToken = `Bearer ${token}`;

export default mockToken;
