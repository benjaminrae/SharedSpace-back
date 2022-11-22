import mongoose from "mongoose";
import { environment } from "../loadEnvironment.js";

const { mongoDbDebug } = environment;

const connectDatabase = async (mongoDbUri: string) => {
  await mongoose.connect(mongoDbUri);

  mongoose.set("debug", mongoDbDebug);

  mongoose.set("toJSON", {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return ret;
    },
  });
};

export default connectDatabase;
