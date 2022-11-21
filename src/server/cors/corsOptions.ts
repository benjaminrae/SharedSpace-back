import type { CorsOptions } from "cors";
import allowedOrigins from "./allowedOrigins.js";

const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, requestOrigin);
      return;
    }

    callback(new Error("Not allowed by CORS"), requestOrigin);
  },
};

export default corsOptions;
