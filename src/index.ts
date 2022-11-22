import { environment } from "./loadEnvironment.js";
import debugConfig from "debug";
import chalk from "chalk";
import { MongoServerError } from "mongodb";
import startServer from "./server/startServer.js";
import app from "./server/app.js";
import connectDatabase from "./database/connectDatabase.js";

const debug = debugConfig("shared-space:root");

const { port, mongoDbUri } = environment;

try {
  await connectDatabase(mongoDbUri);
  debug(chalk.green.bold("Connected to database"));

  await startServer(app, port);
  debug(chalk.green.bold(`Server running on http://localhost:${port}`));
} catch (error: unknown) {
  debug(
    chalk.red.bold(
      `${
        error instanceof MongoServerError
          ? "There was an error connecting to the database:"
          : "There was an error starting the server:"
      } ${(error as Error).message}`
    )
  );
}
