import { Joi } from "express-validation";
import type { UserStructure } from "../../database/models/types";
import {
  anyOnlyProperty,
  stringEmptyProperty,
  stringMinimumProperty,
} from "./schemaProperties.js";

interface RegisterUserBody extends UserStructure {
  confirmPassword: string;
}

const registerUserSchema = {
  body: Joi.object<RegisterUserBody>({
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
      })
      .label("Password"),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .label("Confirm Password")
      .messages({
        [anyOnlyProperty]: "Passwords must match",
        [stringEmptyProperty]: "Password is required",
      }),
  }),
};

export default registerUserSchema;
