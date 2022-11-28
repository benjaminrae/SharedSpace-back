import { Router } from "express";
import { addLocation } from "../../controllers/locationsControllers/locationsControllers";
import multer from "multer";
import paths from "../paths";
import fileFilter from "../../utils/fileFilter/fileFilter";
import { environment } from "../../../loadEnvironment";

const {
  partialPaths: { addPath },
} = paths;

const { maxFileSize } = environment;

const upload = multer({
  dest: "uploads",
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter,
});

// eslint-disable-next-line new-cap
const locationsRouter = Router();

locationsRouter.post(addPath, upload.single("image"), addLocation);

export default locationsRouter;
