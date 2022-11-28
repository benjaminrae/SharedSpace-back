import fs from "fs/promises";
import getUploadPath from "../getUploadPath/getUploadPath";
import cleanUploads from "./cleanUploads";

const uploadsPath = "uploads";

beforeAll(async () => {
  try {
    await fs.access(uploadsPath);
  } catch {
    await fs.mkdir(uploadsPath);
  }

  const firstFile = Buffer.from("");
  const secondFile = Buffer.from("");
  const thirdFile = Buffer.from("");

  await fs.writeFile(getUploadPath("firstFile"), firstFile);
  await fs.writeFile(getUploadPath("secondFile"), secondFile);
  await fs.writeFile(getUploadPath("thirdFile"), thirdFile);
});

describe("Given the function cleanUploads", () => {
  describe("When it is invoked and there are three files in the uploads folder", () => {
    test("Then it should empty the uploads folder", async () => {
      await cleanUploads();

      const uploadsAfter = await fs.readdir(uploadsPath);

      expect(uploadsAfter.length).toBe(0);
    });
  });
});