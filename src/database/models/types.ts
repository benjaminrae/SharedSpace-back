import type { InferSchemaType } from "mongoose";
import type { userSchema } from "./User";

export type UserStructure = InferSchemaType<typeof userSchema>;
