import fs from "fs/promises";
import sharp from "sharp";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import type { CustomRequest } from "../auth/types";
import type { LocationStructure } from "../../controllers/locationsControllers/types";
import getUploadPath from "../../utils/getUploadPath/getUploadPath.js";
import { bucket } from "../../utils/supabaseConfig.js";

export const backupImages = async (
  req: CustomRequest<
    Record<string, unknown>,
    Record<string, unknown>,
    LocationStructure
  >,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    next();
    return;
  }

  const {
    images,
    images: { image, small },
  } = req.body;

  try {
    const mainImageName = image;
    const smallImageName = small;

    const mainImageContents = await fs.readFile(mainImageName);
    const smallImageContents = await fs.readFile(smallImageName);

    await bucket.upload(mainImageName, mainImageContents, {
      cacheControl: "31536000",
    });
    await bucket.upload(smallImageName, smallImageContents, {
      cacheControl: "31536000",
    });

    const {
      data: { publicUrl: mainPublicUrl },
    } = bucket.getPublicUrl(mainImageName);

    const {
      data: { publicUrl: smallPublicUrl },
    } = bucket.getPublicUrl(smallImageName);

    images.backup = mainPublicUrl;
    images.backupSmall = smallPublicUrl;

    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const renameImages = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    next();
    return;
  }

  const timeStamp = Date.now();

  const fileExtension = path.extname(req.file.originalname);
  const fileBaseName = path.basename(req.file.originalname, fileExtension);
  const newFileName = `${fileBaseName}-${timeStamp}${fileExtension}`;
  const newFilePath = getUploadPath(newFileName);

  try {
    await fs.rename(getUploadPath(req.file.filename), newFilePath);

    req.file.filename = newFileName;
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const resizeImages = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    next();
    return;
  }

  try {
    const originalFile = getUploadPath(req.file.filename);
    const smallFile = getUploadPath(`small-${req.file.filename}`);
    const originalExtension = path.extname(originalFile);
    const smallExtension = path.extname(smallFile);
    const originalBaseName = path.basename(originalFile, originalExtension);
    const smallBaseName = path.basename(smallFile, smallExtension);
    const newMainFile = getUploadPath(`${originalBaseName}.webp`);
    const newSmallFile = getUploadPath(`${smallBaseName}.webp`);
    const smallImageWidth = 248;
    const mainImageWidth = 1118;

    await fs.copyFile(originalFile, smallFile);

    await sharp(originalFile)
      .resize({ width: mainImageWidth })
      .webp({ quality: 90 })
      .toFormat("webp")
      .toFile(newMainFile);

    await sharp(smallFile)
      .resize({ width: smallImageWidth })
      .webp({ quality: 90 })
      .toFormat("webp")
      .toFile(newSmallFile);

    req.body.images = { image: newMainFile, small: newSmallFile };

    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const serveFallbackImage = (
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction
) => {
  const { originalUrl } = req;

  const {
    data: { publicUrl },
  } = bucket.getPublicUrl(originalUrl);

  res.redirect(publicUrl);
};
