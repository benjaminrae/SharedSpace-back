import { Router } from "express";
import multer from "multer";
import {
  addLocation,
  deleteLocationById,
  getLocations,
  getMyLocations,
} from "../../controllers/locationsControllers/locationsControllers.js";
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
  partialPaths: { addPath, myLocationsPath, deleteLocationPath },
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

locationsRouter.get("", getLocations);

locationsRouter.get(myLocationsPath, auth, getMyLocations);

locationsRouter.post(
  addPath,
  auth,
  upload.single("image"),
  renameImages,
  resizeImages,
  backupImages,
  addLocation
);

locationsRouter.delete(deleteLocationPath, auth, deleteLocationById);

export default locationsRouter;
