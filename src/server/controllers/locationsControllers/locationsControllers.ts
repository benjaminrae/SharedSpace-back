import type { Request, Response, NextFunction } from "express";
import Location from "../../../database/models/Location.js";
import type { CustomRequest } from "../../middleware/auth/types";
import { authErrors, locationErrors } from "../../utils/errors.js";
import getLinks from "../../utils/getLinks.js";
import httpStatusCodes from "../../utils/httpStatusCodes.js";
import type { LocationStructure, UpdateLocationBody } from "./types";

const { locationNotFoundError } = locationErrors;

const {
  successCodes: { createdCode, okCode },
} = httpStatusCodes;

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
  const { services } = receivedLocation;

  let parsedServices = {};

  if (typeof services === "string") {
    parsedServices = JSON.parse(services) as Partial<LocationStructure>;
  }

  try {
    const newLocation = await Location.create({
      ...receivedLocation,
      owner: userId,
      services: {
        ...parsedServices,
      },
      images: {
        ...receivedLocation.images,
        image: `${req.protocol}://${req.get("host")}/${
          receivedLocation.images.image
        }`,
        small: `${req.protocol}://${req.get("host")}/${
          receivedLocation.images.small
        }`,
      },
    });

    res.status(createdCode).json({
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

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, services } = req.query;

    let filter = {};
    if (services) {
      const serviceIds = (services as string)
        .split(",")
        .map((service) => service);
      filter = serviceIds.reduce(
        (servicesFilter, service) =>
          Object.assign(servicesFilter, { [`services.${service}`]: true }),
        {}
      );
    }

    const locations = await Location.find(filter)
      .limit(+limit * 1)
      .skip((+page - 1) * +limit)
      .exec();

    const count = await Location.countDocuments(filter);

    const [next, previous] = getLinks(req, count, services as string);

    res.status(okCode).json({ count, next, previous, locations });
  } catch (error: unknown) {
    next(error);
  }
};

export const getMyLocations = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    const { page = 1, limit = 10 } = req.query;

    const locations = await Location.find({ owner: userId })
      .limit(+limit * 1)
      .skip((+page - 1) * +limit)
      .exec();

    const count = await Location.countDocuments({ owner: userId });

    const [next, previous] = getLinks(req, count);

    res.status(okCode).json({ count, next, previous, locations });
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteLocationById = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { locationId } = req.params;

  const { forbiddenError } = authErrors;

  try {
    const location = await Location.findOne({ _id: locationId });

    if (location.owner.toString() !== userId) {
      next(forbiddenError);
      return;
    }

    await location.delete();

    res.status(okCode).json({ message: "Location deleted successfully" });
  } catch (error: unknown) {
    next(error);
  }
};

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { locationId } = req.params;

  try {
    const location = await Location.findById(locationId);

    if (!location) {
      next(locationNotFoundError);
      return;
    }

    res.status(okCode).json({ location });
  } catch (error: unknown) {
    next(error);
  }
};

export const updateLocation = (
  req: CustomRequest<
    Record<string, unknown>,
    Record<string, unknown>,
    UpdateLocationBody
  >,
  res: Response,
  next: NextFunction
) => {
  const receivedLocation = req.body;
  const { services } = receivedLocation;

  let parsedServices = {};

  if (typeof services === "string") {
    parsedServices = JSON.parse(services) as Partial<LocationStructure>;
  }

  try {
    const updatedLocation = Location.findByIdAndUpdate(
      receivedLocation.id,
      {
        ...receivedLocation,
        services: {
          ...parsedServices,
        },
        images: {
          ...receivedLocation.images,
          image: `${req.protocol}://${req.get("host")}/${
            receivedLocation.images.image
          }`,
          small: `${req.protocol}://${req.get("host")}/${
            receivedLocation.images.small
          }`,
        },
      },
      { returnDocument: "after" }
    );

    res.status(okCode).json({ location: updatedLocation });
  } catch (error: unknown) {
    next(error);
  }
};
