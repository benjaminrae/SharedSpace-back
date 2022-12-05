import type { InferSchemaType } from "mongoose";
import type mongoose from "mongoose";
import type { locationSchema } from "../../../database/models/Location";

export type LocationStructure = InferSchemaType<typeof locationSchema>;

export interface LocationWithIdStructure extends LocationStructure {
  _id: mongoose.Types.ObjectId;
}

export interface UpdateLocationBody extends LocationStructure {
  id: string;
}
