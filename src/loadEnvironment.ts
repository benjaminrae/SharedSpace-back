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
  supabaseUrl: string;
  supabaseKey: string;
  supabaseBucket: string;
  uploadPath: string;
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
  SUPABASE_URL: supabaseUrl,
  SUPABASE_KEY: supabaseKey,
  SUPABASE_BUCKET: supabaseBucket,
  UPLOAD_PATH: uploadPath,
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
  supabaseBucket,
  supabaseKey,
  supabaseUrl,
  uploadPath,
};
