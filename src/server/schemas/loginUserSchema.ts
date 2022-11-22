import { Joi } from "express-validation";
import type { UserStructure } from "../../database/models/types";

const loginUserSchema = {
  body: Joi.object<UserStructure>({
    username: Joi.string()
      .min(5)
      .required()
      .message("Username is required and should have 5 characters minimum"),
    password: Joi.string()
      .min(8)
      .required()
      .message("Password is required and should have 8 characters minimum"),
  }),
};

export default loginUserSchema;
