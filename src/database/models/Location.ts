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
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  services: {
    allDayAccess: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    freeTeaCoffee: { type: Boolean, default: false },
    eventManagement: { type: Boolean, default: false },
    freeTrial: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    meetingRoom: { type: Boolean, default: false },
    reception: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    photocopier: { type: Boolean, default: false },
    printer: { type: Boolean, default: false },
    projector: { type: Boolean, default: false },
    scanner: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    whiteboard: { type: Boolean, default: false },
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
