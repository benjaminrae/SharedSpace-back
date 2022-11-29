import cleanUploads from "./server/utils/files/cleanUploads.js";

afterAll(async () => {
  await cleanUploads();
});
