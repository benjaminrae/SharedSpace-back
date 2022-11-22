import type { CorsOptions } from "cors";
import CustomError from "../../CustomError/CustomError.js";
import { environment } from "../../loadEnvironment.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";

const { allowedOrigins } = environment;

const {
  clientErrors: { badRequestCode },
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
        badRequestCode,
        "Not allowed by CORS"
      ),
      requestOrigin
    );
  },
};

export default corsOptions;
