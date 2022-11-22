import dotenv from "dotenv";

dotenv.config();

interface Environment {
  port: number;
  debug: string;
  mongoDbDebug: boolean;
  mongoDbUri: string;
}

const {
  PORT: port,
  DEBUG: debug,
  MONGO_DB_DEBUG: mongoDbDebug,
  MONGO_DB_URI: mongoDbUri,
} = process.env;

export const environment: Environment = {
  port: +port,
  debug,
  mongoDbDebug: mongoDbDebug === "true",
  mongoDbUri,
};
