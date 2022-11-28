import { Router } from "express";
import { addLocation } from "../../controllers/locationsControllers/locationsControllers";
import multer from "multer";
import paths from "../paths";
import fileFilter from "../../utils/fileFilter/fileFilter";

const {
  partialPaths: { addPath },
} = paths;

const upload = multer({
  dest: "uploads",
  limits: {
    fileSize: 8000000,
  },
  fileFilter,
});

// eslint-disable-next-line new-cap
const locationsRouter = Router();

locationsRouter.post(addPath, upload.single("image"), addLocation);

export default locationsRouter;
