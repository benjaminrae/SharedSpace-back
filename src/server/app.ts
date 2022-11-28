import cors from "cors";
import express from "express";
import morgan from "morgan";
import corsOptions from "./cors/corsOptions.js";
import { generalError, unknownEndpoint } from "./middleware/errors/errors.js";
import locationsRouter from "./routers/locationsRouter/locationsRouter.js";
import paths from "./routers/paths.js";
import usersRouter from "./routers/usersRouter/usersRouter.js";

const {
  partialPaths: { usersPath, locationsPath },
} = paths;

const app = express();

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.disable("x-powered-by");
app.use("/uploads", express.static("uploads"));

app.use(usersPath, usersRouter);

app.use(locationsPath, locationsRouter);

app.use(unknownEndpoint);
app.use(generalError);

export default app;
