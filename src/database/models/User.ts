import { Schema, model } from "mongoose";

export const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  owner: {
    type: Boolean,
    required: true,
  },
});

const User = model("User", userSchema, "users");

export default User;
