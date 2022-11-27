import type { Response, NextFunction } from "express";
import Location from "../../../database/models/Location";
import type { CustomRequest } from "../../middleware/auth/types";
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

    res.status(201).json({
      location: {
        ...newLocation.toJSON(),
        images: {
          image: newLocation.images.image,
          small: newLocation.images.small,
        },
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};
