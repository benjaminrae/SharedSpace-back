import dotenv from "dotenv";

dotenv.config();

interface Environment {
  port: number;
  debug: string;
  mongoDbDebug: boolean;
  mongoDbUri: string;
  allowedOrigins: string[];
  jwtSecret: string;
  tokenExpiry: string;
  saltLength: number;
}

const {
  PORT: port,
  DEBUG: debug,
  MONGO_DB_DEBUG: mongoDbDebug,
  MONGO_DB_URI: mongoDbUri,
  ALLOWED_ORIGINS: allowedOrigins,
  JWT_SECRET: jwtSecret,
  TOKEN_EXPIRY: tokenExpiry,
  SALT_LENGTH: saltLength,
} = process.env;

export const environment: Environment = {
  port: +port,
  debug,
  mongoDbDebug: mongoDbDebug === "true",
  mongoDbUri,
  allowedOrigins: allowedOrigins.split(","),
  jwtSecret,
  tokenExpiry,
  saltLength: +saltLength,
};
