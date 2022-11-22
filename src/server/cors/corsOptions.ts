import type { CorsOptions } from "cors";
import CustomError from "../../CustomError/CustomError.js";
import allowedOrigins from "./allowedOrigins.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";

const {
  clientErrors: { badRequest },
} = httpStatusCodes;

const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, requestOrigin);
      return;
    }

    callback(
      new CustomError(
        `${requestOrigin} not allowed by CORS`,
        badRequest,
        "Not allowed by CORS"
      ),
      requestOrigin
    );
  },
};

export default corsOptions;
