import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import type { Response, NextFunction } from "express";
import type { CustomRequest } from "../auth/types";
import { environment } from "../../../loadEnvironment";
import type { LocationStructure } from "../../controllers/locationsControllers/types";
import getUploadPath from "../../utils/getUploadPath/getUploadPath";

const { supabaseBucket, supabaseKey, supabaseUrl } = environment;

const supabase = createClient(supabaseUrl, supabaseKey);

const bucket = supabase.storage.from(supabaseBucket);

export const backupImages = async (
  req: CustomRequest<
    Record<string, unknown>,
    Record<string, unknown>,
    LocationStructure
  >,
  res: Response,
  next: NextFunction
) => {
  const {
    images,
    images: { image, small },
  } = req.body;

  try {
    const mainImageName = image;
    const smallImageName = small;

    const mainImageContents = await fs.readFile(getUploadPath(mainImageName));
    const smallImageContents = await fs.readFile(getUploadPath(smallImageName));

    await bucket.upload(mainImageName, mainImageContents);
    await bucket.upload(smallImageName, smallImageContents);

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
