import dotenv from "dotenv";

dotenv.config();

interface Environment {
  port: number;
  debug: string;
  mongoDbDebug: boolean;
  mongoDbUri: string;
  allowedOrigins: string[];
}

const {
  PORT: port,
  DEBUG: debug,
  MONGO_DB_DEBUG: mongoDbDebug,
  MONGO_DB_URI: mongoDbUri,
  ALLOWED_ORIGINS: allowedOrigins,
} = process.env;

export const environment: Environment = {
  port: +port,
  debug,
  mongoDbDebug: mongoDbDebug === "true",
  mongoDbUri,
  allowedOrigins: allowedOrigins.split(","),
};
