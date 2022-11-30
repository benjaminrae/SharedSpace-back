import type { Request, Response, NextFunction } from "express";
import Location from "../../../database/models/Location.js";
import type { CustomRequest } from "../../middleware/auth/types";
import doesFileExist from "../../utils/files/doesFileExist.js";
import type { LocationStructure } from "./types";

export const addLocation = async (
  req: CustomRequest<
    Record<string, unknown>,
    Record<string, unknown>,
    LocationStructure
  >,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const receivedLocation = req.body;

  try {
    const newLocation = await Location.create({
      ...receivedLocation,
      owner: userId,
    });

    const image = (await doesFileExist(newLocation.images.image))
      ? `${req.protocol}://${req.get("host")}/${newLocation.images.image}`
      : newLocation.images.backup;

    const small = (await doesFileExist(newLocation.images.small))
      ? `${req.protocol}://${req.get("host")}/${newLocation.images.small}`
      : newLocation.images.backupSmall;

    res.status(201).json({
      location: {
        ...newLocation.toJSON(),
        images: {
          image,
          small,
        },
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const locations = await Location.find({})
      .limit(+limit * 1)
      .skip((+page - 1) * +limit)
      .exec();

    const count = await Location.countDocuments();

    const next =
      +page < count / +limit
        ? `${req.protocol}://${req.get("host")}${req.url}?page=${
            +page + 1
          }&limit=${limit as string}`
        : null;
    const previous =
      page > 1
        ? `${req.protocol}://${req.get("host")}${req.url}?page=${
            +page - 1
          }&limit=${limit as string}`
        : null;

    res.status(200).json({ count, next, previous, locations });
  } catch (error: unknown) {
    next(error);
  }
};
