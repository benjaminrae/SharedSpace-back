import { Joi } from "express-validation";
import type { LoginCredentials } from "../../database/models/types";
import {
  stringEmptyProperty,
  stringMinimumProperty,
} from "./schemaProperties.js";

const loginUserSchema = {
  body: Joi.object<LoginCredentials>({
    username: Joi.string()
      .min(5)
      .required()
      .messages({
        [stringMinimumProperty]: "Username must have 5 characters minimum",
        [stringEmptyProperty]: "Username is required",
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        [stringMinimumProperty]: "Password should have 8 characters minimum",
        [stringEmptyProperty]: "Password is required",
      }),
  }),
};

export default loginUserSchema;
