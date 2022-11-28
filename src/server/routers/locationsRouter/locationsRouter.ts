import { Router } from "express";
import multer from "multer";
import { addLocation } from "../../controllers/locationsControllers/locationsControllers.js";
import paths from "../paths.js";
import fileFilter from "../../utils/fileFilter/fileFilter.js";
import { environment } from "../../../loadEnvironment.js";
import auth from "../../middleware/auth/auth.js";
import {
  backupImages,
  renameImages,
  resizeImages,
} from "../../middleware/images/images.js";

const {
  partialPaths: { addPath },
} = paths;

const { maxUploadSize } = environment;

const upload = multer({
  dest: "uploads",
  limits: {
    fileSize: maxUploadSize,
  },
  fileFilter,
});

// eslint-disable-next-line new-cap
const locationsRouter = Router();

locationsRouter.post(
  addPath,
  auth,
  upload.single("image"),
  renameImages,
  resizeImages,
  backupImages,
  addLocation
);

export default locationsRouter;
