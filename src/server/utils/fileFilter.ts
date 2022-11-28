import type multer from "multer";
import type { CustomRequest } from "../middleware/auth/types";
import { imageErrors } from "./errors";

const fileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (!file) {
    callback(null, false);
    return;
  }

  const { mimetype, originalname } = file;

  if (
    !/((?:.png$|.jpg$|.jpeg$|.avif$|.webp$))/.test(originalname) ||
    !/((?:png$|jpeg$|avif$|webp$))/.test(mimetype)
  ) {
    callback(imageErrors.imageFormatError);
    return;
  }

  callback(null, true);
};

export default fileFilter;
