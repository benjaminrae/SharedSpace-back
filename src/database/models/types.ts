import type { InferSchemaType } from "mongoose";
import type { userSchema } from "./User";

export type LoginCredentials = Omit<
  InferSchemaType<typeof userSchema>,
  "owner"
>;
export type UserStructure = InferSchemaType<typeof userSchema>;
