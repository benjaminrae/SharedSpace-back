import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { LoginCredentials } from "../../../database/models/types";
import User from "../../../database/models/User.js";
import { loginErrors, registerErrors } from "../../utils/errors.js";
import type { CustomTokenPayload } from "./types";
import { environment } from "../../../loadEnvironment.js";
import type { RegisterUserBody } from "../../schemas/registerUserSchema";

const { jwtSecret, tokenExpiry, saltLength } = environment;

export const loginUser = async (
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    LoginCredentials
  >,
  res: Response,
  next: NextFunction
) => {
  const { userNotFoundError, incorrectPasswordError } = loginErrors;
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      next(userNotFoundError);
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      next(incorrectPasswordError);
      return;
    }

    const tokenPayload: CustomTokenPayload = {
      username,
      id: user._id.toString(),
      owner: user.owner,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: tokenExpiry });

    res.status(200).json({ token });
  } catch (error: unknown) {
    next(error);
  }
};

export const registerUser = async (
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    RegisterUserBody
  >,
  res: Response,
  next: NextFunction
) => {
  const { password, username, owner } = req.body;
  const { alreadyRegisteredError } = registerErrors;

  try {
    const hashedPassword = await bcrypt.hash(password, saltLength);

    await User.create({
      username,
      owner,
      password: hashedPassword,
    });

    res.status(201).json({ message: "You have registered successfully" });
  } catch (error: unknown) {
    if ((error as Error).message.includes("duplicate key")) {
      next(alreadyRegisteredError);
      return;
    }

    next(error);
  }
};
