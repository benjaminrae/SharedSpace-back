import { ObjectId } from "bson";
import { Schema, model } from "mongoose";

export const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  services: {
    allDayAccess: { type: Boolean },
    airConditioning: { type: Boolean },
    kitchen: { type: Boolean },
    freeTeaCoffee: { type: Boolean },
    eventManagement: { type: Boolean },
    freeTrial: { type: Boolean },
    wifi: { type: Boolean },
    meetingRoom: { type: Boolean },
    reception: { type: Boolean },
    parking: { type: Boolean },
    photocopier: { type: Boolean },
    printer: { type: Boolean },
    projector: { type: Boolean },
    scanner: { type: Boolean },
    tv: { type: Boolean },
    whiteboard: { type: Boolean },
  },
  images: {
    image: {
      type: String,
    },
    small: {
      type: String,
    },
    backup: {
      type: String,
    },
    backupSmall: {
      type: String,
    },
  },
});

const Location = model("Location", locationSchema, "locations");

export default Location;
