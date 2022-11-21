import dotenv from "dotenv";

dotenv.config();

interface Environment {
  port: number;
  debug: string;
}

const { PORT: port, DEBUG: debug } = process.env;

export const environment: Environment = { port: +port, debug };
