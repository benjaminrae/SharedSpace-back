import type { InferSchemaType } from "mongoose";
import type { locationSchema } from "../../../database/models/Location";

export type AddLocationBody = InferSchemaType<typeof locationSchema>;
